"use client";

import { useState } from "react";
import { ScreenItem } from "./ScreenItem";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyScreensDialog } from "./CopyScreensDialog";
import { CopyConfirmDialog, PreviewResult } from "./CopyConfirmDialog";
import { toast } from "sonner";
import { confirmScreenChanges, previewScreenChanges } from "@/lib/actions/file.actions";
import {Loader2} from "lucide-react";

type ViewMode =  "text" | "compact" | "normal";

export function ScreenList({
                               screens,
                               loadedScreen,
                               onLoadScreen,
                           }: {
    screens: string[];
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
}) {
    const [viewMode, setViewMode] = useState<ViewMode>("text");
    const [pendingPreviews, setPendingPreviews] = useState<PreviewResult[] | null>(null);
    const [sourceFolder, setSourceFolder] = useState<string>();
    const [selectedTextScreen, setSelectedTextScreen] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function handleCopy(selected: string[]) {
        const res = await previewScreenChanges(selected);
        if (res.success && res.previews) {
            setPendingPreviews(res.previews);
            setSourceFolder(res.sourceFolder);
        } else {
            toast.error(res.message || "Preview failed");
        }
        return res;
    }

    const extraScreens = screens.filter((item) => item !== loadedScreen);

    return (
        <div className="w-full flex flex-col gap-4">
            {viewMode === "text" ? (
                <div className="flex items-center gap-2">
                    <select
                        className="border rounded px-2 py-1 text-sm flex-1"
                        value={selectedTextScreen}
                        onChange={(e) => setSelectedTextScreen(e.target.value)}
                    >
                        <option value="" disabled>Select a screen</option>
                        {screens.map((screen) => (
                            <option key={screen} value={screen}>{screen}</option>
                        ))}
                    </select>
                    <Button
                        onClick={async () => {
                            if (selectedTextScreen) {
                                try {
                                    setLoading(true);
                                    await onLoadScreen(selectedTextScreen);
                                } finally {
                                    setLoading(false);
                                }
                            } else {
                                toast.error("Please select a screen first");
                            }
                        }}
                        disabled={!selectedTextScreen || loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load"
                        )}
                    </Button>
                    <div className="flex items-center justify-between gap-2 pr-1">
                        {/* <div className="flex items-center gap-2">
                    <Label htmlFor="view-mode" className="text-sm">View Mode</Label>
                    <select
                        id="view-mode"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                        className="border rounded px-2 py-1 text-sm"
                    >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="text">Text</option>
                    </select>
                </div>*/}
                        {loadedScreen && (
                            <CopyScreensDialog screens={extraScreens} copyAction={handleCopy} />
                        )}
                    </div>
                </div>


            ) : (
                <div
                    className={`grid gap-3 w-full ${
                        viewMode === "compact"
                            ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    }`}
                >
                    {screens.map((screen) => (
                        <ScreenItem
                            key={screen}
                            screenName={screen}
                            loadedScreen={loadedScreen}
                            onLoadScreen={onLoadScreen}
                            compact={viewMode === "compact"}
                        />
                    ))}
                </div>
            )}

            {pendingPreviews && sourceFolder && (
                <CopyConfirmDialog
                    sourceFolder={sourceFolder}
                    previews={pendingPreviews}
                    onConfirm={async () => {
                        const res = await confirmScreenChanges(pendingPreviews);
                        if (res.success) toast.success(res.message);
                        else toast.error(res.message);
                        setPendingPreviews(null);
                    }}
                    onCancel={() => setPendingPreviews(null)}
                />
            )}
        </div>
    );
}
