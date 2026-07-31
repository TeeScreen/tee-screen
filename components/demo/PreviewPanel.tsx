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
            {/* Desktop: side panel */}
            <div className="hidden md:block">
                <div className={`w-auto border-sm bg-background flex flex-col h-[91vh]`}>
                    {/* key tied to loadedScreen ensures remount only when it changes */}
                    <PreviewScreen/>
                </div>
            </div>

            {/* Mobile: overlay */}
            <div className=" md:hidden absolute inset-0 z-40">
                <div className={`w-auto border-sm bg-background flex flex-col h-[91vh]`}>
                    {/* key tied to loadedScreen ensures remount only when it changes */}
                    <PreviewScreen/>
                </div>
            </div>
        </div>
    );
}
