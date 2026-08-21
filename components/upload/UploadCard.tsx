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
import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { useDirtyState } from "@/stores/user-store";
import { useFileValidation } from "@/hooks/useFileValidation";
import {triggerUpdateEvent} from "@/lib/actions/file.actions";

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
    const [ext, setExt] = useState<string | null>(null);


    // -------------------------------------------------------
    // CENTRAL ERROR HANDLER (your original)
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
    // PREFLIGHT VALIDATION
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

        // -------------------------------------------------------
        // ENFORCE CORRECT EXTENSION ON newFileName
        // -------------------------------------------------------
        setExt(result.ext); // png, mp4, pdf


        setPreflightValid(true);
        setPreflightMessage(null);
        setFileSelected(true);
    }

    // -------------------------------------------------------
    // CHUNKED UPLOAD (REAL PROGRESS)
    // -------------------------------------------------------
    async function uploadInChunks({
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
        const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        let uploadedChunks = 0;
        let lastTime = performance.now();
        let lastBytes = 0;

        for (let i = 0; i < totalChunks; i++) {
            if (signal.aborted) throw new DOMException("Upload cancelled", "AbortError");

            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append("chunk", chunk);
            formData.append("index", i.toString());
            formData.append("total", totalChunks.toString());
            formData.append("folder", folderName);
            formData.append("name", newFileName); // correct extension enforced

            const now = performance.now();
            const elapsed = (now - lastTime) / 1000;

            let res: Response;

            try {
                res = await fetch("https://teescreenapp.com/api/upload_chunk.php", {
                    method: "POST",
                    body: formData,
                    signal,
                });
            } catch (err: any) {
                reportUploadError(err);
                throw err;
            }

            if (!res.ok) {
                reportUploadError(new Error(`Chunk upload failed (${res.status})`));
                throw new Error(`Chunk upload failed (${res.status})`);
            }

            uploadedChunks++;

            const pct = Math.round((uploadedChunks / totalChunks) * 100);

            const uploadedBytes = uploadedChunks * CHUNK_SIZE;
            const bytesPerSecond = (uploadedBytes - lastBytes) / elapsed;
            const mbps = bytesPerSecond / (1024 * 1024);

            const remainingBytes = file.size - uploadedBytes;
            const eta = remainingBytes / bytesPerSecond;

            onProgress(pct, Math.max(1, Math.round(eta)));
            onSpeed(Number(mbps.toFixed(2)));

            lastTime = now;
            lastBytes = uploadedBytes;
        }

        return { success: true };
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

        if (!newFileName.toLowerCase().endsWith("." + ext)) {
            newFileName = newFileName + "." + ext;
        }

        try {
            const controller = new AbortController();
            setAbortController(controller);

            await uploadInChunks({
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

            setUploadProgress(100);
            setUploadEta(1);
            setUploadSpeed(0);
            triggerUpdateEvent(newFileName,true);
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
