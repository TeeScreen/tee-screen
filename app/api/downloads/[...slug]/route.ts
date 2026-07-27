import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { canShowInBrowser, getMimeTypeFromExtension } from "@/lib/utils";
import { MAX_FILE_SIZE, SERVER_URL } from "@/lib/constants";
import { findFileSafeName } from "@/lib/actions/file.actions";

type Params = Promise<{ slug: string[] }>;

export const GET = async (req: NextRequest, { params }: { params: Params }) => {
    try {
        const { slug } = await params;
        const folderName = slug[0];
        const fileName = slug[1];

        if (!fileName || !folderName) {
            return NextResponse.json({ error: "Folder name and file name are required" }, { status: 400 });
        }

// -------------------------------
        // SAFE-NAME SHORT CIRCUIT
        // -------------------------------
        const isAlreadySafe =
            fileName.startsWith("u-") ||
            fileName.startsWith("d-") ||
            /^[0-9]/.test(fileName);

        const safeFileName = isAlreadySafe
            ? fileName
            : await findFileSafeName(folderName, fileName);        const fileExt = path.extname(safeFileName).toLowerCase();
        const contentType = getMimeTypeFromExtension(fileExt);

        if (!contentType) {
            return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }

        const localPath = path.join(process.cwd(), "tmp", folderName, safeFileName);

        let existsLocally = true;
        try {
            await fsp.access(localPath);
        } catch {
            existsLocally = false;
        }

        const range = req.headers.get("range");

        // --- LOCAL STREAMING ---
        if (existsLocally) {
            const stats = await fsp.stat(localPath);
            const fileSize = stats.size;

            if (fileSize > MAX_FILE_SIZE) {
                return NextResponse.json({ error: "File too large" }, { status: 400 });
            }

            if (range) {
                const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
                const start = parseInt(startStr, 10);
                const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
                const chunkSize = end - start + 1;

                const stream = fs.createReadStream(localPath, { start, end });

                return new NextResponse(stream as any, {
                    status: 206,
                    headers: {
                        "Content-Type": contentType,
                        "Content-Length": chunkSize.toString(),
                        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "public, max-age=31536000, immutable",
                    },
                });
            }

            // No range → full stream
            const stream = fs.createReadStream(localPath);
            return new NextResponse(stream as any, {
                headers: {
                    "Content-Type": contentType,
                    "Content-Length": fileSize.toString(),
                    "Accept-Ranges": "bytes",
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        // --- EXTERNAL STREAMING ---
        const externalUrl = `${SERVER_URL}/tmp/${folderName}/${safeFileName}`;
        const externalRes = await fetch(externalUrl, {
            headers: range ? { Range: range } : {},
        });

        if (!externalRes.ok) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const headers = new Headers(externalRes.headers);
        headers.set("Content-Type", contentType);
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new NextResponse(externalRes.body, {
            status: externalRes.status,
            headers,
        });

    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};