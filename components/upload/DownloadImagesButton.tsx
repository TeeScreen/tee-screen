'use client';

import React from 'react'
import {Button} from "@/components/ui/button";
import {downloadClubImages, upload} from "@/lib/actions/file.actions";

const DownloadImagesButton = ({folderName}: {folderName:string}) => {

    const handleSubmit = async () => {
        const result = await downloadClubImages(folderName);

    };

    return (
        <form onSubmit={handleSubmit}>
            <Button type="submit" variant="outline" className="w-full">
                Download Images
            </Button>
        </form>
    )
}
export default DownloadImagesButton
