"use client";

import { useState, useTransition } from "react";
import { useDirtyState } from "@/stores/user-store";
import { AccountItem } from "@/components/screen/AccountItem";

import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AccountDropdown({
                                    accounts,
                                    loadedAccount,
                                    loadAction,
                                    deleteAction,
                                }: {
    accounts: { accountLogin: string; accountPW: string }[];
    loadedAccount: string | null;
    loadAction: (formData: FormData) => Promise<void>;
    deleteAction: (formData: FormData) => Promise<void>;
}) {
    const {dirty, setDirty} = useDirtyState();
    const [pending, setPending] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleSelect(login: string) {
        if (login === loadedAccount) return;

        const acc = accounts.find(a => a.accountLogin === login);
        if (!acc) return;

        if (dirty) {
            setPending(login);
            setOpen(true);
            return;
        }

        const fd = new FormData();
        fd.append("login", acc.accountLogin);
        fd.append("password", acc.accountPW);

        startTransition(() => loadAction(fd));
    }

    function confirmLoad() {
        if (!pending) return;

        const acc = accounts.find(a => a.accountLogin === pending);
        if (!acc) return;

        const fd = new FormData();
        fd.append("login", acc.accountLogin);
        fd.append("password", acc.accountPW);

        startTransition(() => loadAction(fd));
        setDirty(false);
        setOpen(false);
        setPending(null);
    }

    const activeAccount = accounts.find(a => a.accountLogin === loadedAccount) || null;

    return (
        <div className="flex flex-col gap-6 w-full max-w-lg">

            {/* TITLE */}
            <h2 className="text-sm font-medium text-muted-foreground">
                Selected Account
            </h2>

            {/* DROPDOWN */}
            <Select value={loadedAccount ?? ""} onValueChange={handleSelect}>
                <SelectTrigger>
                    <SelectValue placeholder="Select an account…"/>
                </SelectTrigger>

                <SelectContent>
                    {accounts.map(acc => (
                        <SelectItem key={acc.accountLogin} value={acc.accountLogin}>
                            {acc.accountLogin}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* CONFIRMATION DIALOG */}
            <Dialog open={open} onOpenChange={v => !isPending && setOpen(v)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            Switching accounts will discard your unsaved changes. Continue?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" disabled={isPending} onClick={() => setOpen(false)}>
                            Cancel
                        </Button>

                        <Button variant="destructive" disabled={isPending} onClick={confirmLoad}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isPending ? "Loading…" : "Continue"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* LOADED ACCOUNT INFO PANEL */}
            {activeAccount && (
                <AccountItem
                    account={activeAccount}
                    isLoaded={true}
                    onLoad={(login, pw) => {
                        const fd = new FormData();
                        fd.append("login", login);
                        fd.append("password", pw);
                        startTransition(() => loadAction(fd));
                    }}
                    onDelete={(login) => {
                        const fd = new FormData();
                        fd.append("login", login);
                        startTransition(() => deleteAction(fd));
                    }}
                />
            )}
        </div>
    );
}