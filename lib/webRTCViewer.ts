// =============================================================================
//  webRTCViewer.ts  -  VIEWER-ONLY rewrite for ID-locked signaling server
// =============================================================================
//  Drop into any Next.js app under e.g. /lib/webRTCViewer.ts.
//  Talks to the Node.js signaling server using:
//    -> register-sender / sender-registered          (sender side, not used here)
//    -> request-sender                                (we send this)
//    <- sender-unavailable | viewer-request           (server feedback)
//    <- deliver-peer-id                               (sender's SDP offer)
//    -> viewer-answer                                 (we send our answer)
//    -> viewer-ice                                    (we send our ICE)
//    <- sender-ice                                    (sender's ICE)
//    <- sender-disconnected                           (sender went away)
//
//  This class is framework agnostic; the React component (VideoViewer.tsx)
//  consumes it via callbacks.
// =============================================================================

// ---------- Hard-coded signaling endpoint (change to your Render URL) -------
export const SIGNALING_WS_URL = 'wss://websocketserver-aqmy.onrender.com/ws';
//export const SIGNALING_WS_URL = 'ws://localhost:5000';
export const DEFAULT_STUN_URL = 'stun:stun.l.google.com:19302';
// ----------------------------------------------------------------------------

export type ViewerStatus =
    | 'idle'
    | 'connecting-ws'
    | 'ws-open'
    | 'requesting-sender'
    | 'sender-unavailable'
    | 'awaiting-offer'
    | 'negotiating'
    | 'connected'
    | 'sender-disconnected'
    | 'closed'
    | 'error';

export interface WebRTCViewerCallbacks {
    onStatus?: (status: ViewerStatus, detail?: string) => void;
    onRemoteStream?: (stream: MediaStream) => void;
    onLog?: (msg: string) => void;
    onError?: (err: Error) => void;
}

interface InboundMessage {
    type: string;
    senderId?: string;
    peerId?: string;          // SDP offer JSON (string), as broadcast by server
    candidate?: RTCIceCandidateInit | string;
    answer?: unknown;
}

export class WebRTCViewer {
    private ws: WebSocket | null = null;
    private pc: RTCPeerConnection | null = null;
    private remoteStream: MediaStream | null = null;
    private senderId: string;
    private stunUrl: string;
    private wsUrl: string;
    private cbs: WebRTCViewerCallbacks;
    private pendingIce: RTCIceCandidateInit[] = [];
    private hasRemoteDescription = false;
    private status: ViewerStatus = 'idle';

    constructor(
        senderId: string,
        cbs: WebRTCViewerCallbacks = {},
        opts: { wsUrl?: string; stunUrl?: string } = {}
    ) {
        this.senderId = senderId;
        this.cbs = cbs;
        this.wsUrl = opts.wsUrl ?? SIGNALING_WS_URL;
        this.stunUrl = opts.stunUrl ?? DEFAULT_STUN_URL;
    }

    // ---------------------------------------------------------------------------
    //  Public API
    // ---------------------------------------------------------------------------
    public async connect(): Promise<void> {
        if (this.ws) {
            this.log('connect() called while already connected; closing first.');
            this.close();
        }

        this.setStatus('connecting-ws');
        this.log(`Opening WebSocket to ${this.wsUrl}`);

        return new Promise<void>((resolve, reject) => {
            let resolved = false;
            try {
                this.ws = new WebSocket(this.wsUrl);
            } catch (e) {
                this.fail(e as Error);
                reject(e);
                return;
            }

            this.ws.onopen = () => {
                this.setStatus('ws-open');
                this.log('WebSocket open. Requesting sender id=' + this.senderId);
                this.setStatus('requesting-sender');
                this.sendJson({ type: 'request-sender', senderId: this.senderId });
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };

            this.ws.onmessage = (ev) => {
                this.handleMessage(ev.data).catch((e) => this.fail(e as Error));
            };

            this.ws.onerror = (ev) => {
                this.log('WebSocket error: ' + JSON.stringify(ev));
            };

            this.ws.onclose = () => {
                this.log('WebSocket closed.');
                if (this.status !== 'closed' && this.status !== 'sender-disconnected') {
                    this.setStatus('closed');
                }
                this.teardownPeer();
            };
        });
    }

    public close(): void {
        this.teardownPeer();
        if (this.ws) {
            try { this.ws.close(); } catch { /* noop */ }
            this.ws = null;
        }
        this.setStatus('closed');
    }

    public getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    // ---------------------------------------------------------------------------
    //  Inbound message handling
    // ---------------------------------------------------------------------------
    private async handleMessage(raw: string | ArrayBuffer | Blob): Promise<void> {
        let text: string;
        if (typeof raw === 'string') text = raw;
        else if (raw instanceof Blob) text = await raw.text();
        else text = new TextDecoder().decode(raw);

        let msg: InboundMessage;
        try { msg = JSON.parse(text) as InboundMessage; }
        catch { this.log('Bad JSON: ' + text); return; }

        this.log(`recv: ${msg.type}`);

        switch (msg.type) {
            case 'sender-unavailable':
                this.setStatus('sender-unavailable', `Sender '${this.senderId}' is offline. Waiting…`);
                break;

            case 'deliver-peer-id': {
                // Server forwards the sender's SDP offer here. The Unity side sends
                // it as a JSON string under the `peerId` field.
                if (!msg.peerId) { this.log('deliver-peer-id missing peerId'); return; }

                let offer: RTCSessionDescriptionInit;
                try {
                    const parsed = typeof msg.peerId === 'string' ? JSON.parse(msg.peerId) : msg.peerId;
                    // Unity emits { type: \"offer\", sdp: \"...\" }
                    offer = { type: parsed.type as RTCSdpType, sdp: parsed.sdp as string };
                } catch (e) {
                    this.fail(new Error('Failed to parse offer: ' + (e as Error).message));
                    return;
                }

                this.setStatus('negotiating', 'Received sender offer; building answer.');
                await this.handleOffer(offer);
                break;
            }

            case 'sender-ice': {
                if (!msg.candidate) return;
                const init = this.parseCandidate(msg.candidate);
                if (!init) return;
                if (!this.pc || !this.hasRemoteDescription) {
                    this.pendingIce.push(init);
                    return;
                }
                try { await this.pc.addIceCandidate(new RTCIceCandidate(init)); }
                catch (e) { this.log('addIceCandidate failed: ' + (e as Error).message); }
                break;
            }

            case 'sender-disconnected':
                this.setStatus('sender-disconnected', 'The sender disconnected.');
                this.teardownPeer();
                break;

            default:
                this.log('unhandled type: ' + msg.type);
        }
    }

    private parseCandidate(c: RTCIceCandidateInit | string): RTCIceCandidateInit | null {
        try {
            const obj = typeof c === 'string' ? JSON.parse(c) : c;
            if (!obj || !('candidate' in obj)) return null;
            return obj as RTCIceCandidateInit;
        } catch {
            return null;
        }
    }

    // ---------------------------------------------------------------------------
    //  WebRTC negotiation
    // ---------------------------------------------------------------------------
    private async handleOffer(offer: RTCSessionDescriptionInit): Promise<void> {
        // Always rebuild the peer connection per offer (matches the Unity side which
        // creates a fresh RTCPeerConnection on every viewer-request).
        this.teardownPeer();

        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: this.stunUrl }],
        });

        this.remoteStream = new MediaStream();
        this.cbs.onRemoteStream?.(this.remoteStream);

        this.pc.ontrack = (ev) => {
            this.log(`ontrack ${ev.track.kind}`);
            const stream = this.remoteStream;
            if (!stream) return;
            // Replace any existing track of the same kind, then add the new one.
            stream.getTracks()
                .filter(t => t.kind === ev.track.kind)
                .forEach(t => stream.removeTrack(t));
            stream.addTrack(ev.track);
            this.cbs.onRemoteStream?.(stream);
        };

        this.pc.onicecandidate = (ev) => {
            if (!ev.candidate) return;
            this.sendJson({
                type: 'viewer-ice',
                candidate: JSON.stringify(ev.candidate.toJSON()),
            });
        };

        this.pc.oniceconnectionstatechange = () => {
            if (!this.pc) return;
            this.log('iceConnectionState=' + this.pc.iceConnectionState);
            if (this.pc.iceConnectionState === 'connected' ||
                this.pc.iceConnectionState === 'completed') {
                this.setStatus('connected');
            } else if (this.pc.iceConnectionState === 'failed' ||
                this.pc.iceConnectionState === 'disconnected') {
                this.setStatus('error', 'ICE ' + this.pc.iceConnectionState);
            }
        };

        // Receive-only transceivers ensure we negotiate even if we add no tracks.
        try {
            this.pc.addTransceiver('video', { direction: 'recvonly' });
            this.pc.addTransceiver('audio', { direction: 'recvonly' });
        } catch (e) {
            this.log('addTransceiver failed: ' + (e as Error).message);
        }
        console.log("offer", offer);
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
        this.hasRemoteDescription = true;

        // Drain any ICE that arrived early.
        for (const ice of this.pendingIce) {
            try { await this.pc.addIceCandidate(new RTCIceCandidate(ice)); }
            catch (e) { this.log('drain ICE failed: ' + (e as Error).message); }
        }
        this.pendingIce = [];

        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);

        // Send answer wrapped as a JSON STRING so the Unity SessionDescription.FromJSON parser works.
        this.sendJson({
            type: 'viewer-answer',
            answer: JSON.stringify({ type: answer.type, sdp: answer.sdp }),
        });
        this.log('Sent viewer-answer');
    }

    private teardownPeer(): void {
        if (this.pc) {
            try { this.pc.ontrack = null; } catch { /* noop */ }
            try { this.pc.onicecandidate = null; } catch { /* noop */ }
            try { this.pc.oniceconnectionstatechange = null; } catch { /* noop */ }
            try { this.pc.close(); } catch { /* noop */ }
            this.pc = null;
        }
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach((t) => { try { t.stop(); } catch { /* noop */ } });
            this.remoteStream = null;
        }
        this.hasRemoteDescription = false;
        this.pendingIce = [];
    }

    // ---------------------------------------------------------------------------
    //  Helpers
    // ---------------------------------------------------------------------------
    private sendJson(obj: unknown): void {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.log('send dropped (ws not open): ' + JSON.stringify(obj));
            return;
        }
        this.ws.send(JSON.stringify(obj));
    }

    private setStatus(status: ViewerStatus, detail?: string): void {
        this.status = status;
        this.cbs.onStatus?.(status, detail);
    }

    private log(msg: string): void {
        this.cbs.onLog?.(msg);
        // eslint-disable-next-line no-console
        console.log('[WebRTCViewer]', msg);
    }

    private fail(err: Error): void {
        this.log('ERROR: ' + err.message);
        this.cbs.onError?.(err);
        this.setStatus('error', err.message);
    }
}