"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDirtyState } from "@/stores/user-store";

export function GlobalSSEListener({
    screenName,
    userId,
    fullName
}: {
    screenName: string;
    userId: string;
    fullName: string;
}) {
    const { setDirty } = useDirtyState();
    const [reconnectCount, setReconnectCount] = useState(0);

    const sseUrl = process.env.NEXT_PUBLIC_SSE_URL || "http://localhost:3001";

    useEffect(() => {
        if (!screenName || !userId) return;

        let es: EventSource | null = null;
        let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
        let hasActivity = false;

        // Track user activity on the page
        const handleUserActivity = () => {
            hasActivity = true;
        };

        const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
        activityEvents.forEach(event => {
            window.addEventListener(event, handleUserActivity, { passive: true });
        });

        const cleanupConnection = () => {
            if (es) {
                es.close();
                es = null;
            }
        };

        // Establish SSE connection to standalone server
        const connect = () => {
            const url = `${sseUrl}/events?screen=${encodeURIComponent(screenName)}&userId=${encodeURIComponent(userId)}&fullName=${encodeURIComponent(fullName)}`;
            es = new EventSource(url);

            // Listen for screen update events
            es.addEventListener("screenUpdated", (event) => {
                const data = JSON.parse(event.data);

                if (data.editedBy) {
                    if (data.editedBy === userId) return;

                    if (data.message && data.editedByName) {
                        toast.info(`${data.editedByName} ${data.message}`, {
                            description: "Your preview has been refreshed.",
                            duration: 4000,
                        });
                    } else {
                        toast.info(`${data.editedByName} updated ${data.screen}`, {
                            description: "Your preview has been refreshed.",
                            duration: 4000,
                        });
                    }

                    if (data?.type === "reset") {
                        setDirty(false);
                    } else {
                        setDirty(true);
                    }

                    // Dispatch global event for other components
                    window.dispatchEvent(
                        new CustomEvent("screen-updated", { detail: data })
                    );
                }
            });

            // Handle server-sent inactivity timeout
            es.addEventListener("inactive", () => {
                console.log("Disconnected by SSE server due to inactivity.");
                toast.warning("Disconnected due to inactivity.", {
                    description: "Move your mouse or type to reconnect.",
                    duration: 6000,
                });

                cleanupConnection();

                // Re-register activity listeners that trigger a reconnect once
                const reconnectOnActivity = () => {
                    activityEvents.forEach(e => window.removeEventListener(e, reconnectOnActivity));
                    toast.success("Reconnected to editing session.");
                    setReconnectCount(prev => prev + 1);
                };

                activityEvents.forEach(e => {
                    window.addEventListener(e, reconnectOnActivity, { once: true, passive: true });
                });
            });
        };

        connect();

        // Send activity heartbeat every 1 minute when user has been active
        heartbeatInterval = setInterval(async () => {
            if (hasActivity && es && es.readyState === EventSource.OPEN) {
                hasActivity = false;
                try {
                    await fetch(`${sseUrl}/activity`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, screen: screenName }),
                    });
                } catch (err) {
                    console.error("Failed to send activity heartbeat:", err);
                }
            }
        }, 60 * 1000);

        return () => {
            cleanupConnection();
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, [screenName, userId, fullName, reconnectCount, sseUrl]);

    return null;
}
