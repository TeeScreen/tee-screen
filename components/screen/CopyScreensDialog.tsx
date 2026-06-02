"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

type PreviewResponse = {
    success: boolean;
    previews?: any[];
    message?: string;
};

type CopyScreensDialogProps = {
    screens: string[];
    copyAction: (selected: string[]) => Promise<PreviewResponse>;
};

export function CopyScreensDialog({ screens, copyAction }: CopyScreensDialogProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    function toggleScreen(screen: string) {
        setSelected((prev) =>
            prev.includes(screen) ? prev.filter((s) => s !== screen) : [...prev, screen]
        );
    }

    async function handleSubmit() {
        setIsLoading(true);
        const res = await copyAction(selected); // <-- pass array, not FormData

        if (res?.success) {
            // Preview succeeded — ScreenList will show confirmation dialog
            setOpen(false);
            setSelected([]);
        } else {
            console.error(res?.message || "Preview failed");
        }

        setIsLoading(false);
    }

    return (
        <>
            <Button variant="default" onClick={() => setOpen(true)}>
                Copy Current Screen to...
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Copy Changes</DialogTitle>
                        <DialogDescription>
                            Select screens to preview the changes before confirming.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {screens.map((screen: string) => (
                            <label key={screen} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    value={screen}
                                    checked={selected.includes(screen)}
                                    onChange={() => toggleScreen(screen)}
                                />
                                <span>{screen}</span>
                            </label>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading || selected.length === 0}
                        >
                            {isLoading ? "Loading..." : "Preview"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
