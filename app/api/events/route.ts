import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ✔ correct value

// Global registry: screenName → list of SSE connections
const globalAny = global as any;
if (!globalAny.sseClients) globalAny.sseClients = {};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const screen = searchParams.get("screen");

    if (!screen) {
        return new Response("Missing screen parameter", { status: 400 });
    }

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const client = {
                write: (msg: string) => {
                    try {
                        controller.enqueue(encoder.encode(msg));
                    } catch {
                        // Controller stream might be closed or aborted
                    }
                },
                close: () => {
                    try {
                        controller.close();
                    } catch {
                        // Stream already closed
                    }
                },
            };

            if (!globalAny.sseClients[screen]) {
                globalAny.sseClients[screen] = [];
            }
            globalAny.sseClients[screen].push(client);

            const keepAlive = setInterval(() => {
                client.write(":\n\n");
            }, 15000);

            req.signal.addEventListener("abort", () => {
                clearInterval(keepAlive);
                if (globalAny.sseClients[screen]) {
                    globalAny.sseClients[screen] =
                        globalAny.sseClients[screen].filter((c: any) => c !== client);
                    if (globalAny.sseClients[screen].length === 0) {
                        delete globalAny.sseClients[screen];
                    }
                }
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
