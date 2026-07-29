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
        if (!screenName || !userId) {
            console.warn("[SSE] Missing screenName or userId — SSE listener aborted.", {
                screenName,
                userId
            });
            return;
        }

        let es: EventSource | null = null;
        let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
        let hasActivity = false;

        // Track user activity on the page
        const handleUserActivity = () => {
            hasActivity = true;
            console.debug("[SSE] User activity detected.");
        };

        const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
        activityEvents.forEach(event => {
            window.addEventListener(event, handleUserActivity, { passive: true });
        });

        const cleanupConnection = () => {
            if (es) {
                console.debug("[SSE] Cleaning up EventSource connection.");
                es.close();
                es = null;
            }
        };

        const connect = () => {
            const url = `${sseUrl}/events?screen=${encodeURIComponent(screenName)}&userId=${encodeURIComponent(userId)}&fullName=${encodeURIComponent(fullName)}`;
            console.log(`[SSE] Attempting connection → ${url}`);

            try {
                es = new EventSource(url);

                es.onopen = () => {
                    console.info("[SSE] Connection opened successfully.");
                };

                es.onerror = (err) => {
                    console.error("[SSE] Connection error:", err, {
                        readyState: es?.readyState,
                        url
                    });

                    // Browser auto-reconnects, but log the state
                    if (es?.readyState === EventSource.CLOSED) {
                        console.warn("[SSE] EventSource closed — will attempt reconnect automatically.");
                    }
                };

            } catch (err) {
                console.error("[SSE] Failed to create EventSource:", err);
                return;
            }

            // Listen for screen update events
            es.addEventListener("screenUpdated", (event) => {
                console.debug("[SSE] Received screenUpdated event:", event.data);

                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (err) {
                    console.error("[SSE] Failed to parse screenUpdated payload:", err, event.data);
                    return;
                }

                if (!data.editedBy) {
                    console.warn("[SSE] screenUpdated event missing editedBy field:", data);
                    return;
                }

                if (data.editedBy === userId) {
                    console.debug("[SSE] Ignoring self-update event.");
                    return;
                }

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
                    console.debug("[SSE] Received reset event — clearing dirty state.");
                    setDirty(false);
                } else {
                    console.debug("[SSE] Marking screen as dirty.");
                    setDirty(true);
                }

                console.debug("[SSE] Dispatching global screen-updated event.");
                window.dispatchEvent(
                    new CustomEvent("screen-updated", { detail: data })
                );
            });

            // Handle server-sent inactivity timeout
            es.addEventListener("inactive", () => {
                console.warn("[SSE] Received inactivity event — server disconnected us.");

                toast.warning("Disconnected due to inactivity.", {
                    description: "Move your mouse or type to reconnect.",
                    duration: 6000,
                });

                cleanupConnection();

                const reconnectOnActivity = () => {
                    console.info("[SSE] Activity detected — reconnecting.");
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

                console.debug("[SSE] Sending heartbeat → /activity");

                try {
                    const res = await fetch(`${sseUrl}/activity`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId, screen: screenName }),
                    });

                    if (!res.ok) {
                        console.error("[SSE] Heartbeat request failed:", res.status, res.statusText);
                    } else {
                        console.debug("[SSE] Heartbeat acknowledged by server.");
                    }
                } catch (err) {
                    console.error("[SSE] Failed to send activity heartbeat:", err);
                }
            } else {
                console.debug("[SSE] Heartbeat skipped — no activity or connection not open.", {
                    hasActivity,
                    readyState: es?.readyState
                });
            }
        }, 60 * 1000);

        return () => {
            console.debug("[SSE] Component unmount — cleaning up.");
            cleanupConnection();
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, [screenName, userId, fullName, reconnectCount, sseUrl]);

    return null;
}
