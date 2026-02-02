import React, {useState} from 'react'
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {deleteFile} from "@/lib/actions/file.actions";

const FilePreview = async ({clubName, fileName} : {clubName: string, fileName: string}) => {
    const handleDelete = async () => {
        await deleteFile(clubName, fileName);
    };
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="text-center py-12 bg-muted/50 rounded-lg border border-muted">
                <p className="text-[#6272a4]">No files uploaded yet</p>
            </div>
        )
    }

    const api_call = `/api/downloads/test/${fileName}`;
    console.log(api_call);
    return (
        <div className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
                <Button
                    type="submit"
                    variant="destructive"
                    className="ml-2 px-3 py-1 rounded-lg"
                    onClick={()=>{handleDelete()}}
                >
                    Delete
                </Button>
            </div>
            <div className="relative aspect-video rounded-md">
                    <Image
                    src={api_call}
                    alt={fileName}
                    fill
                    className="rounded-md object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setError(true)}
                    />
            </div>
        </div>
    )
}
export default FilePreview
