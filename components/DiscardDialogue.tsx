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
import { resetScreenChange} from "@/lib/actions/user.actions";
import {toast} from "sonner";
import { useDirtyState} from "@/stores/user-store";
import {redirect} from "next/navigation";

export function DiscardDialog() {
    const [open, setOpen] = useState(false);
    const {dirty, setDirty} = useDirtyState();

    async function handleConfirm() {
        const result = await resetScreenChange();

        if(result.success) {
            toast("Discarded changes successfully. Please choose new screen to edit");
            setDirty(false);
            redirect("/dashboard/home");
        }
        else {
            toast("Failed to discard changes.");
        }

        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="destructive-button" disabled={!dirty}>Discard Changes</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Discard Changes?</DialogTitle>
                    <DialogDescription>
                        This will discard all your changes and bring you back to the home page.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="outline" className="destructive-button" onClick={handleConfirm}>
                        Discard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}