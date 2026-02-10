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
import { Loader2 } from "lucide-react";
import { useDirtyState } from "@/stores/user-store";

export function ScreenItem({
                               screenName,
                               loadedScreen,
                               onLoadScreen,
                           }: {
    screenName: string;
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
}) {
    const { dirty, setDirty } = useDirtyState();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isLoaded = loadedScreen === screenName;

    async function handleLoad() {
        setIsLoading(true);

        try {
            await onLoadScreen(screenName);
            setDirty(false);
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    }

    function handleClick() {
        if (dirty && !isLoaded) {
            setOpen(true);
        } else {
            handleLoad();
        }
    }

    return (
        <div
            className={`p-4 border rounded-lg w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
                isLoaded ? "bg-muted border-primary/10" : ""
            }`}
        >
            {/* LEFT SIDE — SCREEN NAME */}
            <p className="font-medium break-all">
                {screenName}
                {isLoaded && (
                    <span className="ml-2 text-xs text-primary font-semibold">
                        (Loaded)
                    </span>
                )}
            </p>

            {/* RIGHT SIDE — BUTTON */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                <Button
                    className="flex-1 sm:flex-none"
                    variant={isLoaded ? "secondary" : "default"}
                    disabled={isLoaded || isLoading}
                    onClick={handleClick}
                >
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoaded ? "Loaded" : isLoading ? "Loading..." : "Load Screen"}
                </Button>
            </div>

            {/* CONFIRMATION DIALOG */}
            <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            Loading a new screen will discard your unsaved changes.
                            Do you want to continue?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleLoad}
                            disabled={isLoading}
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isLoading ? "Loading..." : "Continue"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}