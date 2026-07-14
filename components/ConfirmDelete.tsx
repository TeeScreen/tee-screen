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
import { useDirtyState } from "@/stores/user-store";
import { toast } from "sonner";

export function ConfirmDeleteButton({ action }: { action: () => Promise<void> }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setDirty } = useDirtyState();

    async function onConfirm() {
        setLoading(true);

        try {
            await action();

            toast.success("File deleted", {
                description: "The file has been deleted successfully.",
            });

            setDirty(true);
        } catch (err) {
            toast.error("Delete failed", {
                description: "Something went wrong while deleting the file.",
            });
        }

        setLoading(false);
        setOpen(false);
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
                        This will delete the file permanently and may not be retrievable.
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

                    <Button
                        onClick={onConfirm}
                        variant="destructive"
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Deleting…
                            </>
                        ) : (
                            <>Delete</>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
