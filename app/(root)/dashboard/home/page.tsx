import {
    getUserInfo,
    addAccountData,
    removeAccountData,
    saveUserInfo, updateScreenJson, resetScreenChange,
} from "@/lib/actions/user.actions";

import { revalidatePath } from "next/cache";
import { AddAccountDialog } from "@/components/screen/AddAccountDialog";
import { AccountList } from "@/components/screen/AccountList";
import {Button} from "@/components/ui/button";
import {ScreenList} from "@/components/screen/ScreenList";
import { ScreenJsonEditor } from "@/components/ScreenJsonEditor";
import {downloadClubImages} from "@/lib/actions/file.actions";
import { ResetLoadedDataDialog } from "@/components/ResetData";

export default async function HomePage() {
    const user = await getUserInfo();
    const accounts = user?.accountDetails || [];
    const loadedAccount = user?.loadedAccount || null;
    const screenNames = user?.screenNames || [];
    const loadedScreen = user?.loadedScreen || null;
    const screenJson = user?.screenJson;

    // Reset all loaded data
    async function handleReset() {
        "use server";
        await resetScreenChange();
        await saveUserInfo({
            loadedAccount: "",
            screenNames: [],
        });

        revalidatePath("/");
    }

    // Add Account
    async function handleAddAccount(formData: FormData) {
        "use server";

        const accountLogin = formData.get("accountLogin") as string;
        const accountPW = formData.get("accountPW") as string;

        await addAccountData({ accountLogin, accountPW });
        revalidatePath("/");
    }

    // Delete Account
    async function handleDeleteAccount(accountLogin: string) {
        "use server";
        await removeAccountData(accountLogin);
        revalidatePath("/");
    }

    // Load Account Details (fetch screen names)
    async function handleLoadAccountDetails(accountLogin: string, accountPW: string) {
        "use server";

        const response = await fetch(
            `https://teescreenapp.com/api/auth_accounts?user=${accountLogin}&password=${accountPW}`
        );

        const data = await response.json();
        await saveUserInfo({
            loadedAccount: accountLogin,
            screenNames: data
        });

        revalidatePath("/");
    }

    // Load a specific screen
    async function handleLoadScreen(screenName: string) {
        "use server";

        const account = accounts.find((a: { accountLogin: any; }) => a.accountLogin === loadedAccount);
        if (!account) return;

        const response = await fetch(
            `https://teescreenapp.com/api/screen_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenName}`
        );

        const screenData = await response.json();

        await saveUserInfo({
            loadedScreen: screenData.name,
            screenJson: screenData, // <-- FIXED
        });

        if(screenData["FolderNameOnServer"])
        {
            await downloadClubImages(screenData["FolderNameOnServer"]);
        }

        revalidatePath("/");
    }

    return (
        <div className="@container/main flex flex-col gap-4 md:gap-6">
            <h1 className="text-3xl font-bold mb-6">Your Accounts</h1>

            <AddAccountDialog action={handleAddAccount} />

            <AccountList
                accounts={accounts}
                loadedAccount={loadedAccount}
                onLoad={handleLoadAccountDetails}
                onDelete={handleDeleteAccount}
            />

            {(loadedScreen) && (
                <div className="mt-2">
                    <ResetLoadedDataDialog action={handleReset} />
                </div>
            )}

            {screenNames.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold mb-3">
                        Screens for {loadedAccount}
                    </h2>

                    <ScreenList
                        screens={screenNames}
                        loadedScreen={loadedScreen}
                        onLoadScreen={handleLoadScreen}
                    />
                </div>
            )}

            <div className="mt-6">
                {screenJson && (
                    <ScreenJsonEditor
                        initialJson={screenJson}
                        action={updateScreenJson}
                    />
                )}
            </div>

        </div>
    );
}
