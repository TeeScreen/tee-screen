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
import { resetScreenChange } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { useDirtyState } from "@/stores/user-store";
import { redirect } from "next/navigation";
import { Trash } from "lucide-react";

export function DiscardDialog() {
    const [open, setOpen] = useState(false);
    const { dirty, setDirty } = useDirtyState();

    async function handleConfirm() {
        const result = await resetScreenChange();

        if (result.success) {
            toast("Discarded changes successfully. Please choose a new screen to edit");
            setDirty(false);
            redirect("/dashboard/home");
        } else {
            toast("Failed to discard changes.");
        }

        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div>
                    {/* MOBILE: icon only */}
                    <Button
                        variant="outline"
                        className="inline-flex sm:hidden p-2"
                        aria-label="Discard changes"
                    >
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>

                    {/* DESKTOP: full button */}
                    <Button
                        variant="outline"
                        className="hidden sm:inline-flex destructive-button"
                    >
                        Discard Changes
                    </Button>
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-[90%] sm:max-w-md p-4 sm:p-6 rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg font-semibold">
                        Discard Changes?
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                        This will discard all your changes and bring you back to the home page.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        className="w-full sm:w-auto"
                    >
                        Discard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}