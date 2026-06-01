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
import { toast } from "sonner";

export function AddAccountDialog({
                                     action,
                                 }: {
    action: (formData: FormData) => void;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        const username = formData.get("accountLogin") as string;
        const password = formData.get("accountPW") as string;

        if (!username || !password) {
            toast.error("Please enter both a username and password.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                `https://teescreenapp.com/api/validate_login.php?user=${username}&password=${password}`,
                { cache: "no-store" }
            );

            const data = await res.json();

            if (!data.success) {
                toast.error("Invalid username or password.");
                setLoading(false);
                return;
            }

            // SUCCESS → call server action
            action(formData);

            toast.success(`Account "${username}" added successfully.`);
            setOpen(false);

        } catch (err) {
            toast.error("Network error. Please try again later.");
        }

        setLoading(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="py-4">
                    <Button
                        size="sm"
                        className="inline-flex items-center gap-2 w-auto px-2 sm:px-3"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="">Add New Screen</span>
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
                            required
                            className="w-full border px-3 py-2 rounded"
                            placeholder="password"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Validating..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
