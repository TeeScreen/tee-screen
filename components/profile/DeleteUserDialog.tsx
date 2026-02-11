"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {deleteUserAction} from "@/lib/actions/auth.actions";

export function DeleteUserDialog() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();

    function handleDelete() {
        setError("");

        startTransition(async () => {
            const result = await deleteUserAction(password);

            if (result?.error) {
                setError(result.error);
                return;
            }

            // Redirect handled by server action callbackURL
        });
    }

    return (
        <div className="flex w-auto inline-flex border rounded-lg p-2">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Account Deletion</DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        This action is permanent. Please enter your password to confirm.
                    </p>

                    <Input
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isPending}
                    />

                    {error && (
                        <p className="text-sm text-red-500 mt-2">{error}</p>
                    )}

                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending || !password}
                        >
                            {isPending ? "Deleting..." : "Delete Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
