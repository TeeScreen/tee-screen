import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { canShowInBrowser, getMimeTypeFromExtension } from "@/lib/utils";
import { MAX_FILE_SIZE, UPLOAD_DIR } from "@/lib/constants";
import { findFileSafeName } from "@/lib/actions/file.actions";

type Params = Promise<{ slug: string[] }>;

export const GET = async (_: NextRequest, { params }: { params: Params }) => {
    try {
        const { slug } = await params;
        const folderName = slug[0];
        const fileName = slug[1];

        if (!fileName) {
            return NextResponse.json(
                { error: "File name is required" },
                { status: 400 }
            );
        }

        if (!folderName) {
            return NextResponse.json(
                { error: "Folder name is required" },
                { status: 400 }
            );
        }

        // Resolve safe filename
        const safeFileName = await findFileSafeName(folderName, fileName);
        const fileExt = path.extname(safeFileName).toLowerCase();
        const contentType = getMimeTypeFromExtension(fileExt);

        if (!contentType) {
            return NextResponse.json(
                { error: "Invalid file type" },
                { status: 400 }
            );
        }

        // IMPORTANT: Vercel-safe path (no process.cwd())
        const filePath = path.join(UPLOAD_DIR, folderName, safeFileName);
        console.log("filePath", filePath);

        // Ensure file exists
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            );
        }

        const stats = await fs.stat(filePath);
        if (stats.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: "File too large" },
                { status: 400 }
            );
        }

        // Read file into memory (Vercel-safe)
        const file = await fs.readFile(filePath);

        const disposition = canShowInBrowser(fileExt) ? "inline" : "attachment";

        return new NextResponse(file, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
                    fileName
                )}"`,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Security-Policy": "default-src 'self'",
                "X-Content-Type-Options": "nosniff",
                "Content-Length": stats.size.toString(),
                "Accept-Ranges": "bytes",
            },
        });
    } catch (error) {
        console.error("Error processing file:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
};