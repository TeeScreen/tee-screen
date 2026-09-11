"use client";

import { useEffect } from "react";
import { useDirtyState, usePreviewState } from "@/stores/user-store"; // adjust import path
import PreviewScreen from "@/components/demo/PreviewScreen";

export function PreviewPanel({ loadedScreen }: { loadedScreen: string }) {
    const { preview, setPreview } = usePreviewState();

    useEffect(() => {
        if (loadedScreen) {
            setPreview(true);
        }
        else
        {
            setPreview(false);
        }
    }, [loadedScreen, setPreview]);

    if (!loadedScreen || !preview) {
        return null;
    }

    return (
        <div className="visible pointer-events-auto">
            <div
                className="
                w-auto border-sm bg-background flex flex-col
                h-[calc(100vh-52px)]
                 z-40
               static sm:z-auto
            "
            >
                <PreviewScreen />
            </div>
        </div>
    );

}
