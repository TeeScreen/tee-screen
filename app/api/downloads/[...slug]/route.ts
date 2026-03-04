import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { canShowInBrowser, getMimeTypeFromExtension } from "@/lib/utils";
import { MAX_FILE_SIZE, SERVER_URL } from "@/lib/constants";
import { findFileSafeName } from "@/lib/actions/file.actions";

type Params = Promise<{ slug: string[] }>;

export const GET = async (_: NextRequest, { params }: { params: Params }) => {
    try {
        const { slug } = await params;
        const folderName = slug[0];
        const fileName = slug[1];

        if (!fileName || !folderName) {
            return NextResponse.json(
                { error: "Folder name and file name are required" },
                { status: 400 }
            );
        }

        const safeFileName = await findFileSafeName(folderName, fileName);
        const fileExt = path.extname(safeFileName).toLowerCase();
        const contentType = getMimeTypeFromExtension(fileExt);
        if (!contentType) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const localPath = path.join(process.cwd(), "tmp", folderName, safeFileName);

        let fileBuffer: Buffer | null = null;
        let fileSize: number | null = null;

        try {
            await fs.access(localPath);
            const stats = await fs.stat(localPath);

            if (stats.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: "File too large" }, { status: 400 });
            }

            fileBuffer = await fs.readFile(localPath);
            fileSize = stats.size;
        } catch {
            const externalUrl = `${SERVER_URL}/tmp/${folderName}/${safeFileName}`;
            const externalRes = await fetch(externalUrl);

            if (!externalRes.ok) {
                return NextResponse.json({ error: "File not found" }, { status: 404 });
            }

            const arrayBuffer = await externalRes.arrayBuffer();
            fileBuffer = Buffer.from(arrayBuffer);
            fileSize = fileBuffer.length;
        }

        const disposition = canShowInBrowser(fileExt) ? "inline" : "attachment";

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
                    fileName
                )}"`,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Security-Policy": "default-src 'self'",
                "X-Content-Type-Options": "nosniff",
                "Content-Length": fileSize!.toString(),
                "Accept-Ranges": "bytes",
            },
        });
    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};