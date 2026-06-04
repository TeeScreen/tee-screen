"use client"

import { deleteFile, findFileSafeName } from "@/lib/actions/file.actions";
import { getFileType } from "@/lib/utils";
import Image from "next/image";
import path from "path";
import { ConfirmDeleteButton } from "@/components/ConfirmDelete";
import { useEffect, useState } from "react";
import { useDirtyState } from "@/stores/user-store";

const FilePreview = ({ folderName, fileName }: { folderName: string; fileName: string }) => {
    const [resolvedFileName, setResolvedFileName] = useState<string>(fileName);
    const [fileType, setFileType] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { version, dirty, setDirty } = useDirtyState();
    const [initial, setInitial] = useState<boolean>(false);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const resolveFile = async () => {
        setLoading(true);
        await delay(3000);
        const safeFileName = await findFileSafeName(folderName, fileName);

        if (!safeFileName || safeFileName[0] === "d") {
            setResolvedFileName(fileName);
            setFileType(null);
            setLoading(false);
            return;
        }

        const ext = path.extname(safeFileName).toLowerCase();
        setResolvedFileName(safeFileName);
        setFileType(getFileType(ext));
        setInitial(true);
        setLoading(false);
    };

    useEffect(() => {
        resolveFile();
    }, [folderName, fileName]);

    useEffect(() => {
        if (version > 0 && initial) {
            resolveFile();
        }
    }, [version, dirty]);

    const handleDelete = async () => {
        await deleteFile(folderName, resolvedFileName!);
        setResolvedFileName(fileName); // force refresh
        setDirty(true);
    };

    if (loading) {
        return (
            <div className="text-center py-12 rounded-lg border">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
                <p className="mt-2 text-sm">Loading preview...</p>
            </div>
        );
    }

    if (resolvedFileName === fileName) {
        return (
            <div className="text-center py-12 rounded-lg border">
                <p>No file uploaded</p>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                        {resolvedFileName.substring(resolvedFileName.indexOf("-") + 1)}
                    </p>
                </div>
                <ConfirmDeleteButton action={handleDelete} />
            </div>

            {fileType === "image" && (
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

            {fileType === "video" && (
                <video
                    controls
                    src={`/api/downloads/${folderName}/${resolvedFileName}`}
                    className="rounded-md object-contain"
                />
            )}

            {fileType === "audio" && (
                <audio
                    className="w-full mt-3"
                    controls
                    src={`/api/downloads/${folderName}/${resolvedFileName}`}
                    preload="none"
                />
            )}

            {(fileType === "document" || fileType === "other") && (
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
