'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {deleteFile, triggerUpdateEvent, upload} from "@/lib/actions/file.actions";
import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useDirtyState } from "@/stores/user-store";
import path from "path";
import {getFileType} from "@/lib/utils";

export function UploadCard({ folderName, newFileName }: { folderName: string; newFileName: string }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadEta, setUploadEta] = useState<number | null>(null);
    const [uploadSpeed, setUploadSpeed] = useState<number>(0);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const { setDirty } = useDirtyState();
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function uploadWithProgress({
                                          file,
                                          folderName,
                                          newFileName,
                                          onProgress,
                                          onSpeed,
                                          signal,
                                      }: {
        file: File;
        folderName: string;
        newFileName: string;
        onProgress: (pct: number, eta: number) => void;
        onSpeed: (mbps: number) => void;
        signal: AbortSignal;
    })
    {
        const totalBytes = file.size;
        let uploadedBytes = 0;

        let lastTime = performance.now();
        let lastBytes = 0;

        // Ensure extension
        if (!newFileName.includes(".")) {
            const ext = path.extname(file.name).toLowerCase();
            const type = getFileType(ext);
            if (type === "image") newFileName += ".png";
            if (type === "video") newFileName += ".mp4";
            if (type === "document") newFileName += ".pdf";
        }

        const reader: ReadableStreamDefaultReader<Uint8Array> = file.stream().getReader();

        const stream = new ReadableStream({
            async pull(controller) {
                if (signal.aborted) {
                    controller.error("Upload cancelled");
                    return;
                }

                const result: ReadableStreamReadResult<Uint8Array> = await reader.read();
                const { done, value } = result;

                if (done) {
                    controller.close();
                    return;
                }

                controller.enqueue(value);
                uploadedBytes += value.length;

                const now = performance.now();
                const elapsed = (now - lastTime) / 1000;

                if (elapsed >= 0.25) {
                    const bytesPerSecond = (uploadedBytes - lastBytes) / elapsed;
                    const mbps = bytesPerSecond / (1024 * 1024);

                    const remaining = totalBytes - uploadedBytes;
                    const eta = remaining / bytesPerSecond;

                    const pct = Math.round((uploadedBytes / totalBytes) * 100);

                    onProgress(pct, Math.max(1, Math.round(eta)));
                    onSpeed(Number(mbps.toFixed(2)));

                    lastTime = now;
                    lastBytes = uploadedBytes;
                }
            }
        });


        return fetch(
            `https://teescreenapp.com/api/upload_stream.php?folder=${encodeURIComponent(folderName)}&name=${encodeURIComponent(newFileName)}`,
            {
                method: "POST",
                body: stream,
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                signal,
                duplex: "half", // Chrome requires this
            } as any
        );

    }

    let isVideo = false;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isUploading || !fileSelected) return;

        setIsUploading(true);
        setErrorMessage(null);

        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setErrorMessage("No file selected");
            setIsUploading(false);
            return;
        }

        // Detect file type
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        isVideo =
            ext === "mp4";

        try {
            let res;

            // -------------------------------------------------------
            // VIDEO → STREAMING UPLOAD WITH PROGRESS
            // -------------------------------------------------------
            if (isVideo) {
                console.log("Detected video");

                await deleteFile(folderName, newFileName);

                const controller = new AbortController();
                setAbortController(controller);

                res = await uploadWithProgress({
                    file,
                    folderName,
                    newFileName,
                    onProgress: (pct, eta) => {
                        setUploadProgress(pct);
                        setUploadEta(eta);
                    },
                    onSpeed: (mbps) => {
                        setUploadSpeed(mbps);
                    },
                    signal: controller.signal,
                });

                if (!res.ok) {
                    setErrorMessage(`Upload failed (${res.status})`);
                    setIsUploading(false);
                    return;
                }
            }

                // -------------------------------------------------------
                // IMAGE → OLD MULTIPART UPLOAD
            // -------------------------------------------------------
            else {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folderName", folderName);
                formData.append("newFileName", newFileName);

                const result = await upload(formData);

                if (!result.success) {
                    setErrorMessage(result.message);
                    setIsUploading(false);
                    return;
                }
            }

            // -------------------------------------------------------
            // SUCCESS
            // -------------------------------------------------------
            triggerUpdateEvent(newFileName, true);
            setDirty(true);

        } catch (err: any) {
            if (err?.name === "AbortError") {
                setErrorMessage("Upload cancelled");
            } else {
                setErrorMessage(err?.message ?? "Unexpected error");
            }
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";

        setFileSelected(false);
        setIsUploading(false);
        setAbortController(null);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>Choose your file to upload.</CardDescription>
                </CardHeader>

                <CardContent>
                    <Field className="flex gap-2">
                        <FieldLabel htmlFor="file">File</FieldLabel>

                        <Input
                            ref={fileInputRef}
                            name="file"
                            id={folderName}
                            type="file"
                            disabled={isUploading}
                            onChange={(e) => setFileSelected(e.target.files?.length === 1)}
                            className="hover:file:text-primary"
                        />

                        <FieldDescription>Select a file to upload.</FieldDescription>

                        {errorMessage && (
                            <p className="text-destructive">{errorMessage}</p>
                        )}
                    </Field>

                    {isUploading && isVideo && (
                        <div className="w-full mt-4">
                            <div className="relative h-3 w-full rounded bg-neutral-800 overflow-hidden">
                                <div
                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-200"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[steamShimmer_1s_linear_infinite]" />
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                <span>{uploadProgress}%</span>
                                <span>{uploadSpeed} MB/s</span>
                                {uploadEta !== null && <span>{uploadEta}s remaining</span>}
                            </div>

                            <style jsx>{`
                                @keyframes steamShimmer {
                                    from { background-position: 0 0; }
                                    to { background-position: 40px 0; }
                                }
                            `}</style>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isUploading || !fileSelected}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Uploading…
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2" />
                                Upload
                            </>
                        )}
                    </Button>

                    {isUploading && abortController && (
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full"
                            onClick={() => abortController.abort()}
                        >
                            Cancel Upload
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </form>
    );
}
