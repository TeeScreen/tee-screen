"use client";

import { FC, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DiffEntry = {
    path: string;
    oldValue: any;
    newValue: any;
};

export type PreviewResult = {
    targetScreen: string;
    diffs: DiffEntry[];
    merged: any;
    files?: string[];
};

interface CopyConfirmDialogProps {
    sourceFolder: string;
    previews: PreviewResult[];
    onConfirm: (filteredPreviews: PreviewResult[]) => void;
    onCancel: () => void;
}

export const CopyConfirmDialog: FC<CopyConfirmDialogProps> = ({
                                                                  sourceFolder,
                                                                  previews,
                                                                  onConfirm,
                                                                  onCancel,
                                                              }) => {
    const [localPreviews, setLocalPreviews] = useState(previews);

    function removeDiff(targetScreen: string, path: string) {
        setLocalPreviews((prev) =>
            prev.map((p) =>
                p.targetScreen === targetScreen
                    ? { ...p, diffs: p.diffs.filter((d) => d.path !== path) }
                    : p
            )
        );
    }

    function removeFile(targetScreen: string, file: string) {
        setLocalPreviews((prev) =>
            prev.map((p) =>
                p.targetScreen === targetScreen
                    ? { ...p, files: (p.files || []).filter((f) => f !== file) }
                    : p
            )
        );
    }

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Confirm Changes</DialogTitle>
                    <DialogDescription>
                        Review the differences and uploaded files below. Old values are shown in red, new values in green. You can remove changes or files you don’t want to change.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 max-h-[500px] overflow-y-auto">
                    {localPreviews.map((p) => (
                        <div key={p.targetScreen}>
                            <h4 className="font-semibold mb-2">{p.targetScreen}</h4>

                            {/* Uploaded files */}
                            {p.files && p.files.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium">Uploaded Files:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        {p.files.map((file) => {
                                            const ext = file.split(".").pop()?.toLowerCase();
                                            const baseName = file.substring(file.indexOf("-") + 1, file.lastIndexOf("."));
                                            // removes leading "u"/"d" + timestamp and extension
                                            const fileUrl = `/api/downloads/${sourceFolder}/${file}`;

                                            const isAdding = file.toLowerCase().startsWith("u");
                                            const isRemoving = file.toLowerCase().startsWith("d");

                                            return (
                                                <div
                                                    key={file}
                                                    className={`relative border rounded p-2 ${
                                                        isAdding ? "bg-green-50 border-green-300" : isRemoving ? "bg-red-50 border-red-300" : ""
                                                    }`}
                                                >
                                                    {/* Label */}
                                                    <p
                                                        className={`text-sm font-medium mb-2 ${
                                                            isAdding ? "text-green-700" : isRemoving ? "text-red-700" : "text-gray-700"
                                                        }`}
                                                    >
                                                        {isAdding
                                                            ? `Adding ${baseName}`
                                                            : isRemoving
                                                                ? `Removing ${baseName}`
                                                                : file}
                                                    </p>

                                                    {/* Preview */}
                                                    {["png", "jpg", "jpeg", "gif"].includes(ext || "") ? (
                                                        <img
                                                            src={fileUrl}
                                                            alt={file}
                                                            className="rounded-md object-contain w-full"
                                                        />
                                                    ) : ext === "mp4" ? (
                                                        <video
                                                            controls
                                                            src={fileUrl}
                                                            className="rounded-md object-contain w-full"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600"
                                                        >
                                                            {file}
                                                        </a>
                                                    )}

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => removeFile(p.targetScreen, file)}
                                                    >
                                                        Undo Change
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Diffs */}
                            <ul className="space-y-2">
                                {p.diffs.map((d) => (
                                    <li key={d.path} className="border rounded p-2 bg-muted/30">
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-sm">{d.path}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeDiff(p.targetScreen, d.path)}
                                            >
                                                Undo Change
                                            </Button>
                                        </div>
                                        <div className="mt-1 grid grid-cols-2 gap-2 text-sm font-mono">
                                            <div className="bg-red-100 text-red-700 p-1 rounded">
                                                {JSON.stringify(d.oldValue)}
                                            </div>
                                            <div className="bg-green-100 text-green-700 p-1 rounded">
                                                {JSON.stringify(d.newValue)}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => onConfirm(localPreviews)}
                        disabled={localPreviews.every(
                            (p) =>
                                p.diffs.length === 0 &&
                                (!p.files || p.files.length === 0)
                        )}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
