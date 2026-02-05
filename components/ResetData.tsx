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
import { toast } from "sonner";
import { useDirtyState } from "@/stores/user-store";

type Props = {
    action: () => Promise<void>;
};

export function ResetLoadedDataDialog({ action }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { dirty, setDirty } = useDirtyState();

    async function handleConfirm() {
        setIsLoading(true);

        try {
            await action();
            toast("Reset successful.");
            setDirty(false);
        } catch {
            toast("Failed to reset data.");
        }

        setIsLoading(false);
        setOpen(false);
    }

    return (
        <>
            {dirty && (
                <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            Reset Loaded Data
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Loaded Data?</DialogTitle>
                            <DialogDescription>
                                This will clear all loaded account and screen data.
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
                                onClick={handleConfirm}
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isLoading ? "Resetting..." : "Reset"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {!dirty && (
                <Button
                    variant="outline"
                    onClick={handleConfirm}
                    disabled={isLoading}
                >
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoading ? "Resetting..." : "Reset Loaded Data"}
                </Button>
            )}
        </>
    );
}