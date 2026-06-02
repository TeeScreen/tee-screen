import { deleteFile, findFileSafeName } from "@/lib/actions/file.actions";
import { getFileType } from "@/lib/utils";
import Image from "next/image";
import path from "path";
import { ConfirmDeleteButton } from "@/components/ConfirmDelete";
import { SERVER_URL, UPLOAD_DIR } from "@/lib/constants";

const FilePreview = async ({
                               folderName,
                               fileName,
                           }: {
    folderName: string;
    fileName: string;
}) => {
    let safeFileName = await findFileSafeName(folderName, fileName);

    // Detect if filename has an extension
    const hasExt = path.extname(safeFileName).length > 0;

    // Possible extensions to try if missing
    const fallbackExts = [".png", ".mp4"];

    let resolvedFileName = safeFileName;

    if (!hasExt) {
        // Try each extension until one exists
        for (const ext of fallbackExts) {
            const testName = safeFileName + ext;

            const headRes = await fetch(
                `${SERVER_URL}/${UPLOAD_DIR}/${folderName}/${testName}`,
                { method: "HEAD" }
            );

            if (headRes.ok) {
                resolvedFileName = testName;
                break;
            }
        }
    }

    // Final HEAD check for resolved filename
    const headRes = await fetch(
        `${SERVER_URL}/${UPLOAD_DIR}/${folderName}/${resolvedFileName}`,
        { method: "HEAD" }
    );

    const fileExists = headRes.ok && resolvedFileName[0] != "d";

    if (!fileExists) {
        return (
            <div className="text-center py-12 rounded-lg border">
                <p>No file uploaded</p>
            </div>
        );
    }

    const ext = path.extname(resolvedFileName).toLowerCase();
    const type = getFileType(ext);

    const handleDelete = async () => {
        "use server";
        await deleteFile(folderName, resolvedFileName);
    };

    return (
        <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {resolvedFileName.substring(resolvedFileName.indexOf("-") + 1)}
                    </p>
                    {/*<p className="text-xs">
                        {new Date(parseInt(resolvedFileName.split("-")[0])).toLocaleDateString()}
                    </p>*/}
                </div>

                <ConfirmDeleteButton action={handleDelete} />
            </div>

            {type === "image" && (
                <div className="relative aspect-video rounded-md">
                    <Image
                        src={`/api/downloads/${folderName}/${resolvedFileName}`}
                        alt={folderName}
                        fill
                        className="rounded-md object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            {type === "video" && (
                <video
                    controls
                    src={`/api/downloads/${folderName}/${resolvedFileName}`}
                    className="rounded-md object-contain"
                />
            )}

            {type === "audio" && (
                <audio
                    className="w-full mt-3"
                    controls
                    src={`/api/downloads/${folderName}/${resolvedFileName}`}
                    preload="none"
                />
            )}

            {(type === "document" || type === "other") && (
                <div className="mt-2">
                    <a
                        href={`/api/downloads/${folderName}/${resolvedFileName}`}
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