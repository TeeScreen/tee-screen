"use client";

import { usePreviewState } from "@/stores/user-store"; // adjust import path
import PreviewScreen from "@/components/demo/PreviewScreen";

export function PreviewPanel({ loadedScreen }: { loadedScreen: string }) {
    const { preview } = usePreviewState();

const visibility = loadedScreen && preview ? "visible" : "hidden";

    return (
        <div className={`${visibility} w-auto border-sm bg-muted flex flex-col h-full`}>
            <PreviewScreen />
        </div>
    );
}
