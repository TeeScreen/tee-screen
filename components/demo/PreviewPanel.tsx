"use client";

import { useEffect } from "react";
import { useDirtyState, usePreviewState } from "@/stores/user-store"; // adjust import path
import PreviewScreen from "@/components/demo/PreviewScreen";

export function PreviewPanel({ loadedScreen }: { loadedScreen: string }) {
    const { preview, setPreview } = usePreviewState();
    const{ setDirty} = useDirtyState();

    const visibility = loadedScreen && preview ? "visible" : "hidden";

    useEffect(() => {
        if (loadedScreen) {
            setPreview(true);
            setDirty(false);
            console.log("test 3")
        }
    }, [loadedScreen, setPreview]);

    return (
        <div className={`${visibility} w-auto border-sm bg-muted flex flex-col h-full`}>
            {/* key tied to loadedScreen ensures remount only when it changes */}
            <PreviewScreen/>
        </div>
    );
}
