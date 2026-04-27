"use client";

import { useViewer } from "./useViewer";

export default function Viewer() {
    const { videoRef, connected } = useViewer("test-camera");

    return (
        <div style={{ padding: 20 }}>
            <h1>Viewer</h1>

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={false}
                style={{
                    width: "100%",
                    maxWidth: 800,
                    background: "black",
                    borderRadius: 8
                }}
            />

            <p style={{ marginTop: 10 }}>
                {connected ? "Connected to sender" : "Waiting for stream…"}
            </p>
        </div>
    );
}
