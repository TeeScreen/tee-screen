"use client";

import { useState, useTransition } from "react";
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
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDirtyState } from "@/stores/user-store";

type Props = {
    action: () => Promise<void>;
    hasMultipleScreens: boolean;
};

export function ResetLoadedDataDialog({ action, hasMultipleScreens }: Props) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { dirty, setDirty } = useDirtyState();

    const labelText = hasMultipleScreens ? "Reset Loaded Screen Data" : "Refresh Screen Data";
    const titleText = hasMultipleScreens ? "Reset Loaded Screen Data?" : "Refresh Screen Data?";
    const descriptionText = hasMultipleScreens
        ? "This will unload the screen and discard any unsaved changes. You will need to select a screen again."
        : "This will discard any unsaved changes and refresh the screen configuration from the server.";
    const loadingText = hasMultipleScreens ? "Resetting..." : "Refreshing...";
    const successMessage = hasMultipleScreens ? "Reset successful." : "Refresh successful.";
    const failureMessage = hasMultipleScreens ? "Failed to reset data." : "Failed to refresh data.";

    function handleConfirm() {
        startTransition(async () => {
            try {
                await action();
                toast(successMessage);
                setDirty(false);
            } catch {
                toast(failureMessage);
            }
            setOpen(false);
        });
    }

    return (
        <>
            {dirty && (
                <Dialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto inline-flex items-center gap-2">
                            {!hasMultipleScreens && <RefreshCw className="h-4 w-4" />}
                            {labelText}
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{titleText}</DialogTitle>
                            <DialogDescription>
                                {descriptionText}
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={handleConfirm}
                                disabled={isPending}
                            >
                                {isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {loadingText}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {!dirty && (
                <Button
                    variant="outline"
                    onClick={handleConfirm}
                    disabled={isPending}
                    className="w-full sm:w-auto inline-flex items-center gap-2"
                >
                    {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {!isPending && !hasMultipleScreens && <RefreshCw className="h-4 w-4" />}
                    {!isPending && labelText}
                </Button>
            )}
        </>
    );
}