"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Trash } from "lucide-react";
import {useDirtyState} from "@/stores/user-store";

export function ConfirmDeleteButton({ action }: { action: () => Promise<void> }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const {setDirty} = useDirtyState();

    async function onConfirm() {
        setLoading(true);
        await action();
        setLoading(false);
        setOpen(false);
        setDirty(true);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="ml-2 px-3 py-1 rounded-lg destructive-button"
                >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Delete File?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The file will be permanently removed.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>

                    <form action={onConfirm} className="w-full sm:w-auto">
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {loading ? "Deleting..." : "Delete"}
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}