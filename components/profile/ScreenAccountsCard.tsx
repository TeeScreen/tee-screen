"use client";

import React, { useState, useTransition } from "react";
import { Trash2, Key, Monitor, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddAccountDialog } from "@/components/screen/AddAccountDialog";
import {
    deleteAccountAction,
    addAccountAction,
    loadAccountAction,
    reloadAccountAction,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

export default function ScreenAccountsCard({
    accounts,
    loadedAccount,
}: {
    accounts: { accountLogin: string; accountPW: string }[];
    loadedAccount: string | null;
}) {
    const [isPending, startTransition] = useTransition();
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    async function handleAddAccount(formData: FormData) {
        const accountLogin = formData.get("accountLogin") as string;
        const accountPW = formData.get("accountPW") as string;
        
        startTransition(async () => {
            try {
                await addAccountAction({ accountLogin, accountPW });
                // If there was no active account, automatically load this one
                if (!loadedAccount) {
                    await loadAccountAction(accountLogin, accountPW);
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to add account");
            }
        });
    }

    function handleDelete(login: string) {
        setDeleteTarget(login);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        const login = deleteTarget;
        setDeleteTarget(null);

        startTransition(async () => {
            try {
                await deleteAccountAction(login);
                toast.success(`Account "${login}" deleted successfully.`);
            } catch (err: any) {
                toast.error(err.message || "Failed to delete account");
            }
        });
    }

    function handleSelectAccount(login: string) {
        if (login === loadedAccount) return;
        startTransition(async () => {
            try {
                await loadAccountAction(login);
                toast.success(`Account "${login}" loaded successfully.`);
            } catch (err: any) {
                toast.error(err.message || "Failed to load account");
            }
        });
    }

    function handleReload() {
        if (!loadedAccount) return;
        startTransition(async () => {
            try {
                await reloadAccountAction(loadedAccount);
                toast.success(`Screens for "${loadedAccount}" reloaded successfully.`);
            } catch (err: any) {
                toast.error(err.message || "Failed to reload account");
            }
        });
    }

    return (
        <div className="p-5 border border-muted rounded-2xl lg:p-6 bg-card flex flex-col gap-6">
            {/* TITLE & HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-muted/60 pb-4">
                <div>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-primary" /> Screen Accounts
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        Connect, reload, and switch between your TeeScreen account credentials.
                    </p>
                </div>
                <AddAccountDialog action={handleAddAccount} />
            </div>

            {accounts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    {/* ACTIVE ACCOUNT SELECTOR */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Active Screen Login
                        </label>
                        <Select value={loadedAccount ?? ""} onValueChange={handleSelectAccount} disabled={isPending}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an active account…" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.accountLogin} value={acc.accountLogin}>
                                        {acc.accountLogin}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* RELOAD BUTTON */}
                    {loadedAccount && (
                        <Button
                            variant="outline"
                            onClick={handleReload}
                            disabled={isPending}
                            className="w-full inline-flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                            Reload Account
                        </Button>
                    )}
                </div>
            )}

            {/* CONNECTED ACCOUNTS GRID */}
            <div className="flex flex-col gap-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Connected Credentials
                </h5>
                
                {accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20 text-center">
                        <Key className="h-8 w-8 text-muted-foreground mb-2 stroke-[1.5]" />
                        <p className="text-sm font-medium">No Screen Accounts Connected</p>
                        <p className="text-xs text-muted-foreground max-w-xs mt-1">
                            Click "Add New Screen" to connect your TeeScreen account credentials.
                        </p>
                        <AddAccountDialog action={handleAddAccount} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {accounts.map((acc) => {
                            const isActive = acc.accountLogin === loadedAccount;
                            return (
                                <div
                                    key={acc.accountLogin}
                                    className={`p-4 border rounded-xl flex items-center justify-between transition-all duration-300 ${
                                        isActive
                                            ? "bg-primary/5 border-primary/30"
                                            : "bg-muted/10 border-muted group hover:border-primary/20"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium truncate">
                                                {acc.accountLogin}
                                                {isActive && (
                                                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                                        Active
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">TeeScreen Login</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(acc.accountLogin)}
                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Screen Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to disconnect the account <strong>{deleteTarget}</strong>?
                            Any active screens currently edited using this account will be reset.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
