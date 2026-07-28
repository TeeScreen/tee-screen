export async function broadcastScreenUpdate(screenName: string, payload: any) {
    const rawUrl = process.env.INTERNAL_SSE_URL;
    if (!rawUrl) {
        console.warn("INTERNAL_SSE_URL is not set. SSE broadcast skipped.");
        return;
    }

    // Strip any trailing slash so we never get double-slash URLs
    const sseUrl = rawUrl.replace(/\/+$/, "");
    const broadcastUrl = `${sseUrl}/broadcast`;

    try {
        const response = await fetch(broadcastUrl, {
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
            const body = await response.text().catch(() => "");
            console.error(
                `[SSE] Broadcast failed. URL: ${broadcastUrl} | Status: ${response.status} | Body: ${body}`
            );
        }
    } catch (error) {
        console.error(`[SSE] Network error posting to ${broadcastUrl}:`, error);
    }
}
