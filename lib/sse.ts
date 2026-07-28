export async function broadcastScreenUpdate(screenName: string, payload: any) {
    const rawUrl = process.env.INTERNAL_SSE_URL;
    if (!rawUrl) {
        console.warn("[SSE] INTERNAL_SSE_URL is not set. Broadcast skipped.");
        return;
    }

    // Guard: don't send if screenName is empty/null/undefined
    if (!screenName) {
        console.warn("[SSE] broadcastScreenUpdate called with empty screenName. Skipping.");
        return;
    }

    // Strip any trailing slash to avoid double-slash URLs
    const sseUrl = rawUrl.replace(/\/+$/, "");
    const broadcastUrl = `${sseUrl}/broadcast`;

    const body = JSON.stringify({ screen: screenName, payload });
    console.log(`[SSE] Broadcasting to ${broadcastUrl} | screen: "${screenName}" | body: ${body}`);

    try {
        const response = await fetch(broadcastUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body,
        });

        if (!response.ok) {
            const responseBody = await response.text().catch(() => "");
            console.error(
                `[SSE] Broadcast failed. URL: ${broadcastUrl} | Status: ${response.status} | Body: ${responseBody}`
            );
        }
    } catch (error) {
        console.error(`[SSE] Network error posting to ${broadcastUrl}:`, error);
    }
}
