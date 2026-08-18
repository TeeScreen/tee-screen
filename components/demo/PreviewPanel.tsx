"use client";

import { useEffect } from "react";
import { useDirtyState, usePreviewState } from "@/stores/user-store"; // adjust import path
import PreviewScreen from "@/components/demo/PreviewScreen";

export function PreviewPanel({ loadedScreen }: { loadedScreen: string }) {
    const { preview, setPreview } = usePreviewState();

    const visibility = loadedScreen && preview ? "visible" : "hidden";
    const hitTest = loadedScreen && preview ? "pointer-events-auto" : "pointer-events-none";

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
        <div className={`${visibility} ${hitTest}`}>
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
