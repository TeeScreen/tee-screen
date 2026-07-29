"use client";

import { useEffect } from "react";
import { useDirtyState, usePreviewState } from "@/stores/user-store"; // adjust import path
import PreviewScreen from "@/components/demo/PreviewScreen";

export function PreviewPanel({ loadedScreen }: { loadedScreen: string }) {
    const { preview, setPreview } = usePreviewState();

    const visibility = loadedScreen && preview ? "visible" : "hidden";

    useEffect(() => {
        if (loadedScreen) {
            setPreview(true);
        }
        else
        {
            setPreview(false);
        }
    }, [loadedScreen, setPreview]);

    return (
        <div className={`${visibility} w-auto border-sm bg-background flex flex-col h-full`}>
            {/* key tied to loadedScreen ensures remount only when it changes */}
            <PreviewScreen/>
        </div>
    );
}
