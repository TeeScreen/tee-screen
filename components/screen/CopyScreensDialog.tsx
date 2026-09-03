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
    copyAction: (selected: string[], mode: string) => Promise<PreviewResponse>;
};

export function CopyScreensDialog({ screens, copyAction }: CopyScreensDialogProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Mutually exclusive mode toggle
    const [mode, setMode] = useState<"current" | "full">("current");

    function toggleMode(value: "current" | "full") {
        setMode(value);
    }

    function toggleScreen(screen: string) {
        setSelected((prev) =>
            prev.includes(screen)
                ? prev.filter((s) => s !== screen)
                : [...prev, screen]
        );
    }

    async function handleSubmit() {
        setIsLoading(true);

        console.log("MODE SELECTED:", mode);

        const res = await copyAction(selected, mode);

        if (res?.success) {
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
                            Select what to copy and where to copy it.
                        </DialogDescription>
                    </DialogHeader>

                    {/* MODE SECTION */}
                    <div className="flex flex-col gap-3 mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            What to Copy
                        </h3>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={mode === "current"}
                                onChange={() => toggleMode("current")}
                            />
                            <span>Current Changes</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={mode === "full"}
                                onChange={() => toggleMode("full")}
                            />
                            <span>Full Screen</span>
                        </label>
                    </div>

                    {/* SCREEN SELECTION SECTION */}
                    <div className="flex flex-col gap-3 mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Screens to Copy To
                        </h3>
                    </div>

                    <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {screens.map((screen) => (
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
