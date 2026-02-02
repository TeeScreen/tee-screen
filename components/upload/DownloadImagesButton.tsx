'use client';

import React from 'react'
import {Button} from "@/components/ui/button";
import {downloadClubImages, upload} from "@/lib/actions/file.actions";

const DownloadImagesButton = ({clubName}: {clubName:string}) => {

    const handleSubmit = async () => {
        const result = await downloadClubImages(clubName);

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
