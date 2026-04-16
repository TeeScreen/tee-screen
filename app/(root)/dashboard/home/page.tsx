import {
    getUserInfo,
    addAccountData,
    removeAccountData,
    saveUserInfo,
    resetScreenChange, addUserInfo,
} from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

import { revalidatePath } from "next/cache";
import { AddAccountDialog } from "@/components/screen/AddAccountDialog";
import { ScreenList } from "@/components/screen/ScreenList";
import { downloadClubImages } from "@/lib/actions/file.actions";
import { ResetLoadedDataDialog } from "@/components/ResetData";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { AccountDropdown } from "@/components/screen/AccountDropdown";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/dist/server/request/headers";
import {LoadedScreen} from "@/components/screen/LoadedScreen";

export default async function HomePage() {
    let user = await getUserInfo();

    const accounts = user?.accountDetails || [];
    const loadedAccount = user?.loadedAccount || null;
    const screenNames = user?.screenNames || [];
    const loadedScreen = user?.loadedScreen || null;

    async function handleReset() {
        "use server";
        await resetScreenChange();
        //await saveUserInfo({ loadedAccount: "", screenNames: [] });
        revalidatePath("/");
    }

    async function handleAddAccount(formData: FormData) {
        "use server";
        const accountLogin = formData.get("accountLogin") as string;
        const accountPW = formData.get("accountPW") as string;
        await addAccountData({ accountLogin, accountPW });
        revalidatePath("/");
    }

    async function handleDeleteAccount(formData: FormData) {
        "use server";
        const login = formData.get("login") as string;
        await handleReset();
        await removeAccountData(login);
        revalidatePath("/");
    }

    async function handleLoadAccountDetails(formData: FormData) {
        "use server";
        const login = formData.get("login") as string;
        const password = formData.get("password") as string;

        const response = await fetch(
            `https://teescreenapp.com/api/auth_accounts?user=${login}&password=${password}`
        );

        const data = await response.json();

        await saveUserInfo({
            loadedAccount: login,
            screenNames: data,
        });

        revalidatePath("/");
    }

    async function handleLoadScreen(screenName: string) {
        "use server";

        const account = accounts.find((a: any) => a.accountLogin === loadedAccount);
        if (!account) return;

        await resetScreenChange();

        const response = await fetch(
            `https://teescreenapp.com/api/screen_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenName}`
        );

        const screenData = await response.json();

        const analytics_response = await fetch(
            `https://teescreenapp.com/api/analytics_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenData.name}`
        );

        let analyticsData: any;

        if(analytics_response.ok)
        {
            console.log(analytics_response);
            analyticsData = await analytics_response.json();
        }

        await saveUserInfo({
            loadedScreen: screenData.name,
            screenJson: screenData,
            analyticsJson: analyticsData,
        });

        if (screenData["FolderNameOnServer"]) {
            await downloadClubImages(screenData["FolderNameOnServer"]);
        }

        revalidatePath("/");
    }

    return (
        <div className="@container/main flex flex-col gap-4 md:gap-6 px-4 sm:px-6">

            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Your Screens
            </h1>

            {accounts.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch h-100">

                    {/* LEFT: Account Dropdown */}
                    <div className="flex flex-col h-full">
                        <AccountDropdown
                            accounts={accounts}
                            loadedAccount={loadedAccount}
                            loadAction={handleLoadAccountDetails}
                            deleteAction={handleDeleteAccount}
                        />
                        <AddAccountDialog action={handleAddAccount} />

                        {loadedScreen && (
                        <div className="mt-4 sm:mt-2">
                            <ResetLoadedDataDialog action={handleReset} />
                        </div>
                    )}
                    </div>

                    {/* RIGHT: Loaded Screen */}
                    {loadedScreen && (
                        <div className="flex flex-col h-full">
                            <LoadedScreen screenName={loadedScreen} />
                        </div>
                    )}
                </div>
            )}



            {screenNames.length > 0 && (
                <div className="mt-4 sm:mt-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
                        Screens for {loadedAccount}
                    </h2>

                    <div className="overflow-x-auto">
                        <ScreenList
                            screens={screenNames}
                            loadedScreen={loadedScreen}
                            onLoadScreen={handleLoadScreen}
                        />
                    </div>
                </div>
            )}

            {accounts.length === 0 && (
                <div className="p-4 sm:p-6 border rounded-lg bg-muted/30 flex flex-col gap-4">
                    <AddAccountDialog action={handleAddAccount} />

                    <h2 className="text-lg sm:text-xl font-semibold">No Accounts Found</h2>
                    <p className="text-sm text-muted-foreground">
                        It looks like you don’t have any accounts connected yet.
                        If you’d like to get started with TeeScreen, our sales team can help you set up an account and provide a quote.
                    </p>

                    <LeadCaptureForm user={user} />
                </div>
            )}
        </div>
    );
}