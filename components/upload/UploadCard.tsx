'use client';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {upload} from "@/lib/actions/file.actions";
import {useRef, useState} from "react";
import {Upload, Loader2} from "lucide-react";
import {useDirtyState} from "@/stores/user-store";

export function UploadCard({folderName, newFileName}: {folderName: string, newFileName: string}) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [fileSelected, setFileSelected] = useState(false);
    const {setDirty} = useDirtyState();

    const fileInputRef = useRef<HTMLInputElement>(null);

    async function uploadWithProgress({
                                          file,
                                          folderName,
                                          newFileName,
                                          onProgress,
                                      }: {
        file: File;
        folderName: string;
        newFileName: string;
        onProgress: (pct: number, eta: number) => void;
    }) {
        const totalBytes = file.size;
        let uploadedBytes = 0;
        let lastTime = performance.now();
        let lastBytes = 0;

        const reader = file.stream().getReader();

        const stream = new ReadableStream({
            async pull(controller) {
                const { done, value } = await reader.read();

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
                    const remaining = totalBytes - uploadedBytes;
                    const eta = remaining / bytesPerSecond;

                    const pct = Math.round((uploadedBytes / totalBytes) * 100);
                    onProgress(pct, Math.max(1, Math.round(eta)));

                    lastTime = now;
                    lastBytes = uploadedBytes;
                }
            }
        });

        return fetch(
            `${process.env.SERVER_URL}/upload_stream.php?folder=${encodeURIComponent(folderName)}&name=${encodeURIComponent(newFileName)}`,
            {
                method: "POST",
                body: stream,
                headers: {
                    "Content-Type": "application/octet-stream",
                },
            }
        );
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isUploading || !fileSelected) return;

        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        const file = fileInputRef.current?.files?.[0];

        if (!file) {
            setErrorMessage("No file selected");
            setIsUploading(false);
            return;
        }

        formData.append("file", file);
        formData.append("folderName", folderName);
        formData.append("newFileName", newFileName);

        const result = await upload(formData);

        if (!result.success) {
            setErrorMessage(result.message);
        } else {

            setDirty(true);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setFileSelected(false);
        setIsUploading(false);
    };

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
                </CardContent>

                <CardFooter>
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
                </CardFooter>
            </Card>
        </form>
    );
}
