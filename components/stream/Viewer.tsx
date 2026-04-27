"use client";

import { useState } from "react";
import { useViewer } from "./useViewer";

export default function Viewer() {
    const { videoRef, state, error, unmute } = useViewer("test-camera");
    const [muted, setMuted] = useState(true);

    const stateColor =
        state === "connected" ? "#16a34a"
            : state === "failed" || state === "sender-unavailable" ? "#dc2626"
                : state === "disconnected" ? "#a16207"
                    : "#2563eb";

    const stateLabel =
        state === "idle" ? "Idle"
            : state === "signaling" ? "Connecting to signaling…"
                : state === "connecting" ? "Negotiating WebRTC…"
                    : state === "connected" ? "Live"
                        : state === "disconnected" ? "Disconnected"
                            : state === "failed" ? "Failed"
                                : state === "sender-unavailable" ? "Sender not online"
                                    : state;

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui" }}>
            <h1 style={{ marginBottom: 8 }}>Viewer</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span
                    style={{
                        display: "inline-block",
                        width: 10, height: 10, borderRadius: 999,
                        background: stateColor
                    }}
                />
                <span style={{ color: stateColor, fontWeight: 600 }}>{stateLabel}</span>
                {error && <span style={{ color: "#dc2626", marginLeft: 8 }}>· {error}</span>}
            </div>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                // CRITICAL: muted=true is required for autoplay in modern browsers.
                // Webcam streams have no audio anyway. Click the unmute button if you ever add audio.
                muted={muted}
                onClick={() => {
                    // Tap to play — gesture-driven fallback for stricter mobile browsers
                    videoRef.current?.play().catch(() => {});
                }}
                style={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "black",
                    borderRadius: 8,
                    cursor: "pointer"
                }}
            />

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                    onClick={() => {
                        setMuted(false);
                        unmute();
                    }}
                    disabled={!muted}
                    style={{
                        padding: "8px 14px", borderRadius: 6, border: "1px solid #d4d4d8",
                        background: muted ? "#fff" : "#f4f4f5", cursor: muted ? "pointer" : "default"
                    }}
                >
                    {muted ? "Unmute" : "Unmuted"}
                </button>
                <button
                    onClick={() => videoRef.current?.play().catch(() => {})}
                    style={{
                        padding: "8px 14px", borderRadius: 6, border: "1px solid #d4d4d8",
                        background: "#fff", cursor: "pointer"
                    }}
                >
                    Force play
                </button>
            </div>

            <p style={{ marginTop: 12, color: "#71717a", fontSize: 13 }}>
                If the video stays black after "Live" appears, your Unity sender most likely
                isn't running <code>StartCoroutine(WebRTC.Update())</code> or isn't blitting the
                webcam into a RenderTexture. Check Unity logs for "PC state: connected".
            </p>
        </div>
    );
}
