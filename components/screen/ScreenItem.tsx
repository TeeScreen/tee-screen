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
            className={`border rounded-xl p-4 flex flex-col gap-4 shadow-sm transition ${
                isLoaded ? "bg-muted border-primary/30" : "bg-card"
            }`}
        >
            {/* SCREEN NAME */}
            <p className="font-semibold text-lg text-center break-all">
                {screenName}
            </p>

            {/* SCREENSHOT IMAGE (9:16 ratio) */}
            <div className="w-full aspect-[9/16] bg-muted rounded-md overflow-hidden flex items-center justify-center">
                <img
                    src={`/screenshots/${screenName}.jpg`}
                    alt={screenName}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-9x16.png";
                    }}
                />
            </div>

            {/* LOAD BUTTON */}
            <Button
                className="w-full"
                variant={isLoaded ? "secondary" : "default"}
                disabled={isLoaded || isLoading}
                onClick={handleClick}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoaded ? "Loaded" : isLoading ? "Loading..." : "Load Screen"}
            </Button>

            {/* CONFIRMATION DIALOG */}
            <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            Loading a new screen will discard your unsaved changes. Continue?
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
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Loading..." : "Continue"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}