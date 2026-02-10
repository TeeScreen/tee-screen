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
import { Loader2 } from "lucide-react";
import { AccountData } from "@/database/models/user.model";
import { useDirtyState } from "@/stores/user-store";

export function AccountItem({
                                account,
                                isLoaded,
                                onLoad,
                                onDelete,
                            }: {
    account: AccountData;
    isLoaded: boolean;
    onLoad: (login: string, password: string) => void;
    onDelete: (login: string) => void;
}) {
    const { dirty, setDirty } = useDirtyState();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleLoad() {
        setIsLoading(true);

        try {
            await onLoad(account.accountLogin, account.accountPW);
            setDirty(false);
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    }

    function handleClick() {
        if (dirty && !isLoaded) {
            setOpen(true);
        } else {
            handleLoad();
        }
    }

    return (
        <div
            className={`p-4 border rounded-lg w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
                isLoaded ? "bg-muted border-primary/10" : ""
            }`}
        >
            {/* LEFT SIDE — ACCOUNT INFO */}
            <div className="flex flex-col">
                <p className="font-medium break-all">
                    {account.accountLogin}
                    {isLoaded && (
                        <span className="ml-2 text-xs text-primary font-semibold">
                            (Loaded)
                        </span>
                    )}
                </p>

                {account.accountLogin && (
                    <p className="text-sm text-muted-foreground break-all">
                        Login: {account.accountLogin}
                    </p>
                )}
            </div>

            {/* RIGHT SIDE — BUTTONS */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                {/* LOAD BUTTON */}
                <Button
                    className="flex-1 sm:flex-none"
                    variant={isLoaded ? "secondary" : "default"}
                    disabled={isLoaded || isLoading}
                    onClick={handleClick}
                >
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isLoaded ? "Loaded" : isLoading ? "Loading..." : "Load Screens"}
                </Button>

                {/* CONFIRMATION DIALOG */}
                <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Unsaved Changes</DialogTitle>
                            <DialogDescription>
                                Loading a different account will discard your unsaved changes.
                                Do you want to continue?
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
                                variant="destructive"
                                onClick={handleLoad}
                                disabled={isLoading}
                            >
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isLoading ? "Loading..." : "Continue"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* DELETE DIALOG */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="flex-1 sm:flex-none" variant="destructive">
                            Delete
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Account</DialogTitle>
                        </DialogHeader>

                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{account.accountLogin}</strong>?
                        </p>

                        <DialogFooter>
                            <form action={() => onDelete(account.accountLogin)}>
                                <Button variant="destructive" type="submit">
                                    Confirm Delete
                                </Button>
                            </form>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}