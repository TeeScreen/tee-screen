import { useEffect, useRef, useState } from "react";

type ConnState =
    | "idle"
    | "signaling"
    | "connecting"
    | "connected"
    | "disconnected"
    | "failed"
    | "sender-unavailable";

const SIGNAL_URL = "wss://websocketserver-aqmy.onrender.com/ws";
//const SIGNAL_URL = "ws://http://localhost:5000";

export function useViewer(senderId: string) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [state, setState] = useState<ConnState>("idle");
    const [error, setError] = useState<string | null>(null);

    // Refs so React strict-mode double-invoke doesn't leak peer connections
    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
    const cancelledRef = useRef(false);

    useEffect(() => {
        cancelledRef.current = false;
        setError(null);
        setState("signaling");

        const ws = new WebSocket(SIGNAL_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            if (cancelledRef.current) return;
            ws.send(JSON.stringify({ type: "request-sender", senderId }));
        };

        ws.onerror = (e) => {
            console.error("[Viewer] WS error", e);
            setError("signaling error");
            setState("failed");
        };

        ws.onclose = () => {
            console.log("[Viewer] WS closed");
        };

        ws.onmessage = async (event) => {
            if (cancelledRef.current) return;

            let msg: any;
            try { msg = JSON.parse(event.data); }
            catch { return; }

            console.log("[Viewer] WS recv:", msg.type);

            // ----------------------------------------------------
            // Sender unavailable
            // ----------------------------------------------------
            if (msg.type === "sender-unavailable") {
                setState("sender-unavailable");
                return;
            }

            // ----------------------------------------------------
            // Sender disconnected mid-stream
            // ----------------------------------------------------
            if (msg.type === "sender-disconnected") {
                setState("disconnected");
                return;
            }

            // ----------------------------------------------------
            // 1. Sender delivered its offer SDP
            // ----------------------------------------------------
            if (msg.type === "deliver-peer-id") {
                const offerSDP: string = msg.peerId;

                const pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: ["stun:stun.l.google.com:19302"] },
                        // Plug a TURN here for cross-NAT (mobile carriers etc.):
                        // {
                        //     urls: "turn:openrelay.metered.ca:80",
                        //     username: "openrelayproject",
                        //     credential: "openrelayproject"
                        // }
                    ]
                });
                pcRef.current = pc;
                setState("connecting");

                pc.ontrack = (e) => {
                    console.log("[Viewer] ontrack", e.streams);
                    const video = videoRef.current;
                    if (!video) return;

                    if (video.srcObject !== e.streams[0]) {
                        video.srcObject = e.streams[0];
                    }
                    // Try to start playback explicitly. Autoplay can block silently otherwise.
                    video.play().catch((err) => {
                        console.warn("[Viewer] play() blocked:", err.message);
                    });
                };

                pc.onicecandidate = (e) => {
                    if (e.candidate && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: "viewer-ice", candidate: e.candidate }));
                    }
                };

                pc.oniceconnectionstatechange = () => {
                    console.log("[Viewer] iceState:", pc.iceConnectionState);
                    switch (pc.iceConnectionState) {
                        case "connected":
                        case "completed":
                            setState("connected");
                            break;
                        case "disconnected":
                            setState("disconnected");
                            break;
                        case "failed":
                            setState("failed");
                            setError("ICE failed — likely needs TURN");
                            break;
                    }
                };

                try {
                    await pc.setRemoteDescription({ type: "offer", sdp: offerSDP });

                    // Flush ICE candidates that arrived BEFORE pc was created
                    for (const c of pendingIceRef.current) {
                        try { await pc.addIceCandidate(c); }
                        catch (err) { console.warn("[Viewer] flush ICE failed", err); }
                    }
                    pendingIceRef.current = [];

                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    ws.send(JSON.stringify({ type: "viewer-answer", answer: answer.sdp }));
                } catch (err: any) {
                    console.error("[Viewer] negotiation failed", err);
                    setError(err?.message ?? "negotiation failed");
                    setState("failed");
                }
                return;
            }

            // ----------------------------------------------------
            // 2. Sender ICE candidate
            //    If pc isn't ready yet, queue it. The OLD code dropped these.
            // ----------------------------------------------------
            if (msg.type === "sender-ice") {
                const cand: RTCIceCandidateInit = msg.candidate;
                if (!cand) return;
                if (pcRef.current && pcRef.current.remoteDescription) {
                    try { await pcRef.current.addIceCandidate(cand); }
                    catch (err) { console.warn("[Viewer] addIceCandidate failed", err); }
                } else {
                    pendingIceRef.current.push(cand);
                    console.log("[Viewer] queued sender ICE (pc not ready yet)");
                }
            }
        };

        return () => {
            cancelledRef.current = true;
            try { ws.close(); } catch {}
            try { pcRef.current?.close(); } catch {}
            wsRef.current = null;
            pcRef.current = null;
            pendingIceRef.current = [];
        };
    }, [senderId]);

    // Manual unmute helper (autoplay policies)
    const unmute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.play().catch(() => {});
    };

    return { videoRef, state, error, unmute };
}
