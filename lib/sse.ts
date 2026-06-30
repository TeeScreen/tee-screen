const globalAny = global as any;

if (!globalAny.sseClients) {
    globalAny.sseClients = {};
}

export function broadcastScreenUpdate(screenName: string, payload: any) {
    const clients = globalAny.sseClients[screenName];
    if (!clients || clients.length === 0) return;

    const json = JSON.stringify(payload);

    clients.forEach((client: any) => {
        client.write(`event: screenUpdated\n`);
        client.write(`data: ${json}\n\n`);
    });
}
