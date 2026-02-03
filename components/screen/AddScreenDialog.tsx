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

export function AddScreenDialog({
                                    action,
                                }: {
    action: (formData: FormData) => void;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Add Screen</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Screen</DialogTitle>
                </DialogHeader>

                <form action={action} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Login</label>
                        <input
                            name="screenLogin"
                            required
                            className="w-full border px-3 py-2 rounded"
                            placeholder="e.g. dashboard01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <input
                            name="screenPW"
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