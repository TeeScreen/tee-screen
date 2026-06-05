

export const dynamic = 'force-dynamic';

import {
    getUserInfo,
    saveUserInfo,
    resetScreenChange,
} from "@/lib/actions/user.actions";

import { revalidatePath } from "next/cache";
import { ScreenSelector } from "@/components/screen/ScreenSelector";
import { LoadedScreen } from "@/components/screen/LoadedScreen";
import { downloadClubImages } from "@/lib/actions/file.actions";
import { LeadCaptureForm } from "@/components/LeadCaptureForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Monitor, Mail, CircleHelp } from "lucide-react";

// Fetch updates from the TeeScreen server
async function getUpdates(): Promise<{ title: string; date: string }[]> {
    try {
        const res = await fetch("https://teescreenapp.com/Server/updates.json", {
            next: { revalidate: 3600 }, // cache for 1 hour
        });
        if (!res.ok) return [];
        const data = await res.json();

        // The API returns { desc: "<html string>" } — parse it into structured items
        const raw: string = data?.desc ?? "";
        if (!raw.trim()) return [];

        // Parse list items from the HTML string
        const liMatches = raw.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? [];
        return liMatches.map((li) => {
            const text = li.replace(/<[^>]+>/g, "").trim();
            // Try to extract a date at the end like "• DD Mon" or "· DD Mon"
            const dateMatch = text.match(/[•·]\s*(\d{1,2}\s+\w+)\s*$/);
            const date = dateMatch ? dateMatch[1] : "";
            const title = text.replace(/[•·]\s*\d{1,2}\s+\w+\s*$/, "").trim();
            return { title: title || text, date };
        });
    } catch {
        return [];
    }
}

export default async function HomePage() {
    let user = {} as any;
    try {
        user = await getUserInfo();
    } catch (e) {
        console.warn('Failed to fetch user info, using fallback.', e);
    }

    const accounts = user?.accountDetails || [];
    const loadedAccount = user?.loadedAccount || null;
    const screenNames = user?.screenNames || [];
    const loadedScreen = user?.loadedScreen || null;

    const updates = await getUpdates();

    // -----------------------------
    // SERVER ACTIONS
    // -----------------------------

    async function handleResetAction() {
        "use server";
        // If there's more than one screen, we unload the screen. Otherwise, we refresh it.
        await resetScreenChange(screenNames.length > 1);
        revalidatePath("/");
    }

    async function handleLoadScreen(screenName: string) {
        "use server";

        const account = accounts.find(
            (a: any) => a.accountLogin === loadedAccount
        );
        if (!account) {
            console.error("No matching account found for loadedAccount:", loadedAccount);
            return;
        }

        await resetScreenChange(true);

        const screenRes = await fetch(
            `https://teescreenapp.com/api/screen_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenName}`
        );

        if (!screenRes.ok) {
            console.error("Failed to fetch screen data:", screenRes.status, screenRes.statusText);
            return;
        }

        let screenData: any;
        try {
            screenData = await screenRes.json();
        } catch (err) {
            console.error("Invalid JSON in screen_data response:", err);
            return;
        }

        let analyticsData: any = null;

        try {
            const analyticsRes = await fetch(
                `https://teescreenapp.com/api/analytics_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenData.name}`
            );

            if (analyticsRes.ok) {
                try {
                    analyticsData = await analyticsRes.json();
                } catch {
                    console.warn("Analytics JSON malformed");
                }
            }
        } catch {
            console.warn("Analytics request failed");
        }

        await saveUserInfo({
            loadedScreen: screenData.name,
            screenJson: screenData,
            analyticsJson: analyticsData,
        });

        if (screenData["FolderNameOnServer"]) {
            try {
                await downloadClubImages(screenData["FolderNameOnServer"]);
            } catch {
                console.warn("Failed to download club images");
            }
        }
        revalidatePath("/");
    }

    // -----------------------------
    // RENDER
    // -----------------------------
    return (
        <div className="w-full flex flex-col gap-6 px-4 sm:px-6 pb-8 min-w-0 overflow-x-hidden">

            {/* Header */}
            <div className="flex flex-col gap-1 text-left mt-2">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {user?.clubName || "TEE SCREEN"}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                    Open your screen to create changes, then hit Apply to apply them to your live screen.
                </p>
            </div>

            {/* Main Grid */}
            <div
                className={`grid gap-6 items-start grid-cols-2`}
            >
                {/* Left Column */}
                <div className="w-full col-span-2 flex flex-col gap-6 min-w-0">
                    {/* ScreenSelector / Account States */}
                    {accounts.length > 0 ? (
                        loadedAccount ? (
                            <ScreenSelector
                                screens={screenNames}
                                loadedScreen={loadedScreen}
                                onLoadScreen={handleLoadScreen}
                                onResetScreen={handleResetAction}
                            />
                        ) : (
                            <div className="p-6 border border-dashed rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center gap-4">
                                <Monitor className="h-8 w-8 text-muted-foreground" />
                                <h3 className="text-lg font-semibold">No Active Screen Account</h3>
                                <p className="text-sm text-muted-foreground">
                                    To start managing your screen displays, please select which connected account you would like to make active.
                                </p>
                                <Button asChild>
                                    <Link href="/pages/settings">Select Active Account</Link>
                                </Button>
                            </div>
                        )
                    ) : (
                        <div className="p-6 sm:p-8 border border-dashed rounded-2xl bg-muted/20 flex flex-col items-center justify-center text-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <Monitor className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold">Connect Your Screen Account</h2>
                            <p className="text-sm text-muted-foreground">
                                It looks like you don&apos;t have any screen accounts connected yet.
                                To start managing and editing your TeeScreen displays, connect your credentials in Settings.
                            </p>
                            <Button asChild className="mt-2">
                                <Link href="/pages/settings">Go to Account Settings</Link>
                            </Button>
                            <div className="w-full border-t border-muted/60 my-4 pt-6 text-left">
                                <p className="text-xs text-muted-foreground text-center mb-4">
                                    Don&apos;t have a TeeScreen account? Contact our team.
                                </p>
                                <LeadCaptureForm user={user} />
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                        <Link href="/pages/contact" className="p-5 border rounded-2xl bg-card flex items-center gap-4 group">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="text-sm font-semibold">Contact us</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Get help from the Tee Screen team</p>
                            </div>
                        </Link>

                        <Link href="/pages/contact" className="p-5 border rounded-2xl bg-card flex items-center gap-4 group">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                                <CircleHelp className="h-6 w-6" />
                            </div>
                            <div className="text-left min-w-0">
                                <h4 className="text-sm font-semibold">Frequently asked questions</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Quick answers to common things</p>
                            </div>
                        </Link>
                    </div>

                    {/* Updates */}
                    <div className="flex flex-col gap-4 min-w-0">
                        <div className="flex items-center gap-2 text-left">
                            <h3 className="text-base font-bold">Updates</h3>
                            {updates.length > 0 && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                {updates.length} new
              </span>
                            )}
                        </div>
                        <div className="p-6 border bg-card rounded-2xl flex flex-col gap-5">
                            {updates.length > 0 ? (
                                updates.map((update, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <span className="h-2 w-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                        <div className="text-left min-w-0">
                                            <h4 className="text-sm font-semibold">{update.title}</h4>
                                            {update.date && (
                                                <p className="text-xs text-muted-foreground mt-0.5">{update.date}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-2">No updates available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loaded Screen always at bottom */}
            {loadedScreen && (
                <div className="flex flex-col gap-4 min-w-0 max-h-screen overflow-y-auto">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Last Live Screenshot
                    </h3>
                    <LoadedScreen screenName={loadedScreen} />
                </div>
            )}
        </div>
    );


}
