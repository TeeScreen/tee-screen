"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import {usePreviewState} from "@/stores/user-store";

const PreviewScreensaver = ({
                           fileName,
                            label,
                       } : {
    fileName: string,
    label: string,
}) => {
    const { setScreensaver } = usePreviewState();

    const handleClick = async () => {
        setScreensaver(fileName);
    }

    return (
        <div className="flex flex-col gap-1">
            <Button className="w-min" onClick={handleClick}>
                Preview : {label}
            </Button>
            <p className="text-sm text-muted-foreground">
               Click the screensaver on the preview to remove it.
            </p>
        </div>
    );
};
export default PreviewScreensaver
