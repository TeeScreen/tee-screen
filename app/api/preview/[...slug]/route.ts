import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ slug: string[] }>;

export const GET = async (req: NextRequest, { params }: { params: Params }) => {
    try {
        const { slug } = await params;

        const screenName = slug?.[0];
        if (!screenName) {
            return NextResponse.json(
                { error: "Screen name is required" },
                { status: 400 }
            );
        }

        const url = `${process.env.SERVER_URL}/golf-club-images/${screenName}/ScreenPreview.png`;
        console.log("api test:", url);

        // Fetch the image from your external server
        const res = await fetch(url);

        if (!res.ok) {
            // fallback image
            const fallback = await fetch(`${process.env.SERVER_URL}/placeholder-9x16.png`);
            return new NextResponse(fallback.body, {
                headers: {
                    "Content-Type": "image/png",
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        // Return the actual image stream
        return new NextResponse(res.body, {
            headers: {
                "Content-Type": res.headers.get("Content-Type") ?? "image/png",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (err) {
        console.error("Preview error:", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};
