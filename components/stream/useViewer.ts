import { useEffect, useRef, useState } from "react";

export function useViewer(senderId: string) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000");

        let pc: RTCPeerConnection | null = null;

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "request-sender",
                    senderId
                })
            );
        };

        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);

            // ----------------------------------------------------
            // 1. Sender delivered its offer SDP
            // ----------------------------------------------------
            if (msg.type === "deliver-peer-id") {
                const offerSDP = msg.peerId;

                pc = new RTCPeerConnection({
                    iceServers: [
                        { urls: ["stun:stun.l.google.com:19302"] }
                    ]
                });

                // When Unity sends media tracks
                pc.ontrack = (e) => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = e.streams[0];
                    }
                };

                // Send ICE candidates back to sender
                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        ws.send(
                            JSON.stringify({
                                type: "viewer-ice",
                                candidate: e.candidate
                            })
                        );
                    }
                };

                // Apply remote offer
                await pc.setRemoteDescription({
                    type: "offer",
                    sdp: offerSDP
                });

                // Create answer
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // Send answer back to sender
                ws.send(
                    JSON.stringify({
                        type: "viewer-answer",
                        answer: answer.sdp
                    })
                );

                setConnected(true);
            }

            // ----------------------------------------------------
            // 2. Sender ICE candidate → add to peer connection
            // ----------------------------------------------------
            if (msg.type === "sender-ice" && pc) {
                try {
                    await pc.addIceCandidate(msg.candidate);
                } catch (err) {
                    console.error("Failed to add ICE candidate", err);
                }
            }
        };

        return () => {
            ws.close();
            pc?.close();
        };
    }, [senderId]);

    return { videoRef, connected };
}
