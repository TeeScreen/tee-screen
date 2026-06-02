"use client";

import { useState } from "react";
import { ScreenItem } from "./ScreenItem";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CopyScreensDialog } from "./CopyScreensDialog";
import {CopyConfirmDialog, PreviewResult} from "./CopyConfirmDialog";
import { toast } from "sonner";
import {confirmScreenChanges, PreviewResponse, previewScreenChanges} from "@/lib/actions/file.actions";

type DiffEntry = {
    path: string;
    oldValue: any;
    newValue: any;
};

export function ScreenList({
                               screens,
                               loadedScreen,
                               onLoadScreen,
                           }: {
    screens: string[];
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
}) {
    const [compact, setCompact] = useState(true);
    const [pendingPreviews, setPendingPreviews] = useState<PreviewResult[] | null>(null);
    const [sourceFolder, setSourceFolder] = useState<string>();

    async function handleCopy(selected: string[]) {
        const res = await previewScreenChanges(selected);
        if (res.success && res.previews) {
            setPendingPreviews(res.previews);
            setSourceFolder(res.sourceFolder);
        } else {
            toast.error(res.message || "Preview failed");
        }
        return res; // <-- return the PreviewResponse so types match
    }

    const extraScreens = screens.filter(item => item !== loadedScreen);


    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 pr-1">
                <div className="flex items-center gap-2">
                    <Label htmlFor="compact-toggle" className="text-sm">
                        {compact ? "Compact View" : "Normal View"}
                    </Label>
                    <Switch id="compact-toggle" checked={compact} onCheckedChange={setCompact} />
                </div>
                {loadedScreen && (
                    <CopyScreensDialog screens={extraScreens} copyAction={handleCopy} />
                )}
            </div>

            <div
                className={`grid gap-3 w-full ${
                    compact
                        ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
                {screens.map((screen: string) => (
                    <ScreenItem
                        key={screen}
                        screenName={screen}
                        loadedScreen={loadedScreen}
                        onLoadScreen={onLoadScreen}
                        compact={compact}
                    />
                ))}
            </div>

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
