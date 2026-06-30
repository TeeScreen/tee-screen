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
                write: (msg: string) => controller.enqueue(encoder.encode(msg)),
                close: () => controller.close(),
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
                globalAny.sseClients[screen] =
                    globalAny.sseClients[screen].filter((c: any) => c !== client);
                client.close();
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
