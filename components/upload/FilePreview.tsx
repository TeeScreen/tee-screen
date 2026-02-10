import { deleteFile, findFileSafeName } from "@/lib/actions/file.actions";
import { getFileType } from "@/lib/utils";
import fs from "fs/promises";
import Image from "next/image";
import { UPLOAD_DIR } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import path from "path";

const FilePreview = async ({
                               folderName,
                               fileName,
                           }: {
    folderName: string;
    fileName: string;
}) => {
    const safeFileName = await findFileSafeName(folderName, fileName);

    // Ensure folder exists
    try {
        await fs.access(`${UPLOAD_DIR}/${folderName}`);
    } catch {
        await fs.mkdir(`${UPLOAD_DIR}/${folderName}`, { recursive: true });
    }

    // Check if file exists
    let fileExists = true;
    try {
        await fs.access(`${UPLOAD_DIR}/${folderName}/${safeFileName}`);
    } catch {
        fileExists = false;
    }

    if (!fileExists) {
        return (
            <div className="text-center py-12 rounded-lg border">
                <p>No file uploaded</p>
            </div>
        );
    }

    const ext = path.extname(safeFileName).toLowerCase();
    const type = getFileType(ext);


    const handleDelete = async () => {
        "use server";
        await deleteFile(folderName, safeFileName);
    };

    return (
        <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {safeFileName.substring(safeFileName.indexOf("-") + 1)}
                    </p>
                    <p className="text-xs">
                        {new Date(parseInt(safeFileName.split("-")[0])).toLocaleDateString()}
                    </p>
                </div>

                <form action={handleDelete}>
                    <Button
                        type="submit"
                        variant="outline"
                        className="ml-2 px-3 py-1 rounded-lg destructive-button"
                    >
                        Delete
                    </Button>
                </form>
            </div>

            {type === "image" && (
                <div className="relative aspect-video rounded-md">
                    <Image
                        src={`/api/downloads/${folderName}/${safeFileName}`}
                        alt={folderName}
                        fill
                        className="rounded-md object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            {type === "video" && (
                <video
                    className="w-full rounded-md"
                    controls
                    src={`/api/downloads/${folderName}/${safeFileName}`}
                />
            )}

            {type === "audio" && (
                <audio
                    className="w-full mt-3"
                    controls
                    src={`/api/downloads/${folderName}/${safeFileName}`}
                    preload="none"
                />
            )}

            {(type === "document" || type === "other") && (
                <div className="mt-2">
                    <a
                        href={`/api/downloads/${folderName}/${safeFileName}`}
                        className="text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Download File
                    </a>
                </div>
            )}
        </div>
    );
};

export { FilePreview };