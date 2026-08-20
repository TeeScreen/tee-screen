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
import {upload, deleteFile, triggerUpdateEvent} from "@/lib/actions/file.actions";
import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useDirtyState } from "@/stores/user-store";
import { useFileValidation } from "@/hooks/useFileValidation";

export function UploadCard({ folderName, newFileName }: { folderName: string; newFileName: string }) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadEta, setUploadEta] = useState<number | null>(null);
    const [uploadSpeed, setUploadSpeed] = useState<number>(0);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    const [preflightMessage, setPreflightMessage] = useState<string | null>(null);
    const [preflightValid, setPreflightValid] = useState<boolean>(false);

    const { setDirty } = useDirtyState();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { validate } = useFileValidation();

    // -------------------------------------------------------
    // CENTRAL ERROR HANDLER
    // -------------------------------------------------------
    function reportUploadError(err: any, userMessage?: string) {
        console.error("[UPLOAD ERROR]", {
            name: err?.name,
            message: err?.message,
            stack: err?.stack,
            raw: err
        });

        if (err?.name === "AbortError") {
            setErrorMessage("Upload cancelled.");
            return;
        }

        if (userMessage) {
            setErrorMessage(userMessage);
            return;
        }

        if (err?.message?.includes("Failed to fetch")) {
            setErrorMessage("Network issue — please try again.");
            return;
        }

        setErrorMessage("Something went wrong — please try again.");
    }

    // -------------------------------------------------------
    // PREFLIGHT VALIDATION (runs when file is selected)
    // -------------------------------------------------------
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;

        const result = validate(file);

        console.info("[PREFLIGHT VALIDATION]", result.devMessage, {
            fileName: file?.name,
            size: file?.size,
            ext: result.ext,
            type: result.type
        });

        if (!result.isValid) {
            setPreflightValid(false);
            setPreflightMessage(result.userMessage);
            setFileSelected(false);
            return;
        }

        setPreflightValid(true);
        setPreflightMessage(null);
        setFileSelected(true);
    }

    // -------------------------------------------------------
    // STREAMING UPLOAD WITH PROGRESS (VIDEO)
    // -------------------------------------------------------
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
    }) {
        const totalBytes = file.size;
        let uploadedBytes = 0;

        let lastTime = performance.now();
        let lastBytes = 0;

        const reader = file.stream().getReader();

        const stream = new ReadableStream({
            async pull(controller) {
                if (signal.aborted) {
                    controller.error("Upload cancelled");
                    return;
                }

                const result = await reader.read();
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
                duplex: "half",
            } as any
        );
    }

    // -------------------------------------------------------
    // MAIN SUBMIT HANDLER
    // -------------------------------------------------------
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isUploading || !fileSelected || !preflightValid) return;

        setIsUploading(true);
        setErrorMessage(null);

        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setErrorMessage("No file selected.");
            setIsUploading(false);
            return;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const isVideo = ext === "mp4";

        try {
            let res;

            if (isVideo) {
                if(!newFileName.endsWith("mp4"))
                {
                    newFileName = newFileName + ".mp4";
                }

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
                    console.error("[UPLOAD RESPONSE ERROR]", {
                        status: res.status,
                        statusText: res.statusText,
                        url: res.url
                    });

                    setErrorMessage("Upload failed — please try again.");
                    setIsUploading(false);
                    return;
                }
            } else {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("folderName", folderName);
                formData.append("newFileName", newFileName);

                const result = await upload(formData);

                if (!result.success) {
                    console.error("[MULTIPART UPLOAD ERROR]", result);
                    setErrorMessage("Upload failed — please try again.");
                    setIsUploading(false);
                    return;
                }
            }

            triggerUpdateEvent(newFileName, true);
            setDirty(true);

        } catch (err: any) {
            reportUploadError(err);
        }

        if (fileInputRef.current) fileInputRef.current.value = "";

        setFileSelected(false);
        setIsUploading(false);
        setAbortController(null);
    };

    // -------------------------------------------------------
    // UI
    // -------------------------------------------------------
    return (
        <form onSubmit={handleSubmit}>
            <Card className="mx-auto w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                    <CardDescription>
                        Choose your file to upload.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Field className="flex gap-2">
                        <FieldLabel htmlFor="file">File</FieldLabel>

                        <Input
                            name="file"
                            id={folderName}
                            type="file"
                            disabled={isUploading}
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hover:file:text-primary"
                        />

                        <FieldDescription>Select a file to upload.</FieldDescription>

                        {preflightMessage && (
                            <p className="text-destructive">{preflightMessage}</p>
                        )}

                        {errorMessage && (
                            <p className="text-destructive">{errorMessage}</p>
                        )}
                    </Field>

                    {isUploading && (
                        <div className="mt-4 text-sm">
                            <p>Progress: {uploadProgress}%</p>
                            <p>Speed: {uploadSpeed} MB/s</p>
                            <p>ETA: {uploadEta}s</p>
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isUploading || !fileSelected || !preflightValid}
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
                </CardFooter>
            </Card>
        </form>
    );
}
