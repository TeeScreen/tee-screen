export async function broadcastScreenUpdate(screenName: string, payload: any) {
    const sseUrl = process.env.INTERNAL_SSE_URL;
    if (!sseUrl) {
        console.warn("INTERNAL_SSE_URL is not set. SSE broadcast skipped.");
        return;
    }

    try {
        const response = await fetch(`${sseUrl}/broadcast`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                screen: screenName,
                payload,
            }),
        });

        if (!response.ok) {
            console.error(`Failed to broadcast screen update. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error posting screen update to standalone SSE server:", error);
    }
}
