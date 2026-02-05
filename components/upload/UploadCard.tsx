'use client';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {deleteFile, upload} from "@/lib/actions/file.actions";
import {useState} from "react";
import {Upload} from "lucide-react";
import {useDirtyState} from "@/stores/user-store";

export function UploadCard({folderName, newFileName}: {folderName: string, newFileName: string}) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const {dirty, setDirty} = useDirtyState();

    const handleUpload = async (formData: FormData) => {

        formData.append('folderName', folderName);
        formData.append('newFileName', newFileName);
        const result = await upload(formData);
        if (!result.success) {
            setErrorMessage(result.message);
        } else {
            setErrorMessage(null);
            setDirty(true);
        }
    };

    return (
        <form action={handleUpload}>
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
                        <Input name ="file" id={folderName} type="file" className="hover:file:text-primary" />
                        <FieldDescription>Select a file to upload.</FieldDescription>
                        {errorMessage && <p className="text-destructive">{errorMessage}</p>}
                    </Field>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full">
                        <Upload />Upload
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
