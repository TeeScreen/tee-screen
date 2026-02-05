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
import { applyScreenChange } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { useDirtyState } from "@/stores/user-store";
import { Loader2 } from "lucide-react";
import {redirect} from "next/navigation";

export function ApplyDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { dirty, setDirty } = useDirtyState();

    async function handleConfirm() {
        setIsLoading(true);

        const result = await applyScreenChange();

        if (result.success) {
            toast("Applied changes successfully.");
            setDirty(false);
            redirect("/dashboard/home");

        } else {
            toast("Failed to apply changes.");
        }

        setIsLoading(false);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
            <DialogTrigger asChild>
                <Button variant="default" disabled={!dirty || isLoading}>
                    Apply Changes
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Apply Changes?</DialogTitle>
                    <DialogDescription>
                        This will update the active screen with your latest changes.
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
                        variant="default"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isLoading ? "Applying..." : "Apply"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}