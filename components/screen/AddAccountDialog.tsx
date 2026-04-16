"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Plus } from "lucide-react";

export function AddAccountDialog({
                                     action,
                                 }: {
    action: (formData: FormData) => void;
}) {
    const [open, setOpen] = useState(false);

    function handleSubmit(formData: FormData) {
        action(formData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="py-4">
                    <Button
                        size="sm"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            w-auto
                            px-2
                            sm:px-3
                        "
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add New Screen</span>
                    </Button>
                </div>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Screen Login</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Login</label>
                        <input
                            name="accountLogin"
                            required
                            className="w-full border px-3 py-2 rounded"
                            placeholder="screen or admin username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            name="accountPW"
                            type="password"
                            className="w-full border px-3 py-2 rounded"
                            placeholder="password"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
