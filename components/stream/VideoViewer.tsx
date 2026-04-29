'use client';

// =============================================================================
//  VideoViewer.tsx  -  Drop-in Next.js component (App Router or Pages Router)
// =============================================================================
//  Usage:
//    import VideoViewer from '@/components/VideoViewer';
//    export default function WatchPage() { return <VideoViewer />; }
//
//  Renders a small form for the viewer to input a senderId, then connects to
//  the hardcoded signaling server (see /lib/webRTCViewer.ts) and plays the
//  one-way video stream coming from the matching Unity sender.
// =============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { WebRTCViewer, type ViewerStatus } from '@/lib/webRTCViewer';

const STATUS_LABELS: Record<ViewerStatus, string> = {
    idle:                 'Idle',
    'connecting-ws':      'Connecting to signaling server…',
    'ws-open':            'Signaling open',
    'requesting-sender':  'Requesting sender…',
    'sender-unavailable': 'Sender is offline. Will connect when it comes online.',
    'awaiting-offer':     'Waiting for sender offer…',
    negotiating:          'Negotiating WebRTC…',
    connected:            'Live',
    'sender-disconnected':'Sender disconnected.',
    closed:               'Closed',
    error:                'Error',
};

export interface VideoViewerProps {
    /** Optional initial value for the senderId input. */
    initialSenderId?: string;
    /** Optional CSS class for the outer wrapper. */
    className?: string;
}

export default function VideoViewer({
                                        initialSenderId = '',
                                        className,
                                    }: VideoViewerProps) {
    const [senderId, setSenderId] = useState<string>(initialSenderId);
    const [submittedId, setSubmittedId] = useState<string | null>(null);
    const [status, setStatus] = useState<ViewerStatus>('idle');
    const [statusDetail, setStatusDetail] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    const viewerRef = useRef<WebRTCViewer | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const appendLog = useCallback((msg: string) => {
        setLogs((prev) => {
            const next = [...prev, `${new Date().toLocaleTimeString()} ${msg}`];
            return next.length > 200 ? next.slice(-200) : next;
        });
    }, []);

    const stop = useCallback(() => {
        if (viewerRef.current) {
            viewerRef.current.close();
            viewerRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setSubmittedId(null);
        setStatus('closed');
        setStatusDetail('');
    }, []);

    const start = useCallback(
        async (id: string) => {
            if (!id.trim()) return;
            stop();

            const viewer = new WebRTCViewer(id.trim(), {
                onStatus: (s, d) => {
                    setStatus(s);
                    setStatusDetail(d ?? '');
                },
                onLog: (m) => appendLog(m),
                onError: (e) => appendLog('ERROR: ' + e.message),
                onRemoteStream: (stream) => {
                    if (videoRef.current && videoRef.current.srcObject !== stream) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.play().catch((err) =>
                            appendLog('autoplay blocked: ' + (err as Error).message)
                        );
                    }
                },
            });
            viewerRef.current = viewer;
            setSubmittedId(id.trim());
            try { await viewer.connect(); } catch (e) {
                appendLog('connect failed: ' + (e as Error).message);
            }
        },
        [appendLog, stop]
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => { viewerRef.current?.close(); };
    }, []);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        void start(senderId);
    };

    const isConnected = status === 'connected';
    const isStreaming = !!submittedId && status !== 'closed' && status !== 'error';

    return (
        <div
            className={className}
            data-testid="video-viewer"
    style={{
        display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 960,
            margin: '0 auto',
            padding: 16,
            fontFamily: 'system-ui, sans-serif',
            color: '#e8e8e8',
            background: '#0e0e10',
            borderRadius: 12,
    }}
>
<h2 style={{ margin: 0 }}>One-way Video Viewer</h2>

    <form
        onSubmit={onSubmit}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        data-testid="video-viewer-form"
    >
    <input
    type="text"
    value={senderId}
    onChange={(e) => setSenderId(e.target.value)}
    placeholder="Enter Sender ID (e.g. unity-sender-1)"
    data-testid="video-viewer-sender-input"
    style={{
        flex: '1 1 240px',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #2a2a2e',
            background: '#1a1a1d',
            color: '#fff',
            fontSize: 14,
    }}
    disabled={isStreaming}
    />
    {!isStreaming ? (
        <button
            type="submit"
        data-testid="video-viewer-watch-btn"
        style={btnStyle('#4f46e5')}
        disabled={!senderId.trim()}
    >
        Watch
        </button>
    ) : (
        <button
            type="button"
        onClick={stop}
        data-testid="video-viewer-stop-btn"
        style={btnStyle('#b91c1c')}
    >
        Stop
        </button>
    )}
</form>

    <div
        data-testid="video-viewer-status"
    style={{
        fontSize: 13,
            padding: '6px 10px',
            borderRadius: 6,
            background: isConnected ? '#0f3a1f' : '#1a1a1d',
            color: isConnected ? '#5eead4' : '#cbd5e1',
            border: '1px solid #2a2a2e',
    }}
>
<strong>Status:</strong> {STATUS_LABELS[status]}{' '}
    {submittedId && <span style={{ opacity: 0.7 }}>(sender: {submittedId})</span>}
    {statusDetail && (
        <div style={{ marginTop: 4, opacity: 0.85 }}>{statusDetail}</div>
    )}
</div>

    <div
        style={{
            width: '100%',
            aspectRatio: '16 / 9',
            background: '#000',
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
        }}
    >
        <video
            ref={videoRef}
            data-testid="video-viewer-player"
            autoPlay
            playsInline
            muted={false}
            controls
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
            />
            {!isConnected && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                        fontSize: 14,
                        pointerEvents: 'none',
                    }}
                    data-testid="video-viewer-overlay"
                >
            {submittedId ? STATUS_LABELS[status] : 'Enter a sender id and click Watch'}
                </div>
                )}
</div>

<details>
    <summary style={{ cursor: 'pointer', fontSize: 12, opacity: 0.7 }}>Logs</summary>
    <pre
        data-testid="video-viewer-logs"
          style={{
        maxHeight: 220,
        overflow: 'auto',
        background: '#08080a',
        color: '#9ca3af',
        padding: 10,
        borderRadius: 6,
        fontSize: 11,
        margin: '8px 0 0',
    }}
        >
        {logs.join('')}
            </pre>
            </details>
            </div>
            );
        }

            function btnStyle(bg: string): React.CSSProperties {
            return {
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: bg,
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
        };
        }
