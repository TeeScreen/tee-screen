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
    DialogTrigger,
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
            // Show confirmation dialog
            setOpen(true);
        } else {
            // Load immediately
            handleLoad();
        }
    }

    return (
        <div
            className={`p-4 border rounded-lg flex justify-between items-center ${
                isLoaded ? "bg-muted border-primary/10" : ""
            }`}
        >
            <p className="font-medium">
                {screenName}
                {isLoaded && (
                    <span className="ml-2 text-xs text-primary font-semibold">
                        (Loaded)
                    </span>
                )}
            </p>

            {/* MAIN BUTTON */}
            <Button
                variant={isLoaded ? "secondary" : "default"}
                disabled={isLoaded || isLoading}
                onClick={handleClick}
            >
                {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoaded ? "Loaded" : isLoading ? "Loading..." : "Load Screen"}
            </Button>

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