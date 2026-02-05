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
import {useState} from "react";

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
                <Button>Add Account</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Login</label>
                        <input
                            name="accountLogin"
                            required
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g. dashboard01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            name="accountPW"
                            type="password"
                            className="w-full border px-3 py-2 rounded"
                            placeholder="Optional password"
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