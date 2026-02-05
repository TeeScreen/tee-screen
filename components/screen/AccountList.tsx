"use client";

import { AccountData } from "@/database/models/user.model";
import {AccountItem} from "@/components/screen/AccountItem";

export function AccountList({
                               accounts,
                                loadedAccount,
                               onLoad,
                               onDelete,
                           }: {
    accounts: AccountData[];
    loadedAccount: string | null;
    onLoad: (login: string, password: string) => void;
    onDelete: (login: string) => void;
}) {
    if (accounts.length === 0) {
        return <p>No accounts added yet.</p>;
    }

    return (
        <div className="space-y-4">
            {accounts.map((account) => (
                <AccountItem
                    key={account.accountLogin}
                    account={account}
                    isLoaded={loadedAccount === account.accountLogin}
                    onLoad={onLoad}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}