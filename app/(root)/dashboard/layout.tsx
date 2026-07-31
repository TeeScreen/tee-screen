import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { cn } from "@/lib/utils";
import { getPreference } from "@/lib/actions/server-actions";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AccountSwitcher } from "@/components/sidebar/account-switcher";
import { LayoutControls } from "@/components/sidebar/layout-controls";
import { ThemeSwitcher } from "@/components/sidebar/theme-switcher";
import { redirect } from "next/navigation";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/dist/server/request/headers";
import { getUserInfo } from "@/lib/actions/user.actions";
import { ApplyDialog } from "@/components/ApplyDialogue";
import { DiscardDialog } from "@/components/DiscardDialogue";
import { ScreenCollaborators } from "@/components/screen/ScreenCollaborators";

import { GuideMenu } from "@/components/GuideMenu";
import PreviewScreen from "@/components/demo/PreviewScreen";
import { PreviewToggle } from "@/components/demo/PreviewToggle";
import {PreviewTrigger} from "@/components/demo/PreviewTrigger";
import {PreviewPanel} from "@/components/demo/PreviewPanel";
import {GlobalSSEListener} from "@/components/sse/GlobalSSEListener";

export const dynamic = "force-dynamic";

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
    if (!auth) {
        throw new Error("Auth module not initialised");
    }

    let session: any = null;
    try {
        session = await auth.api.getSession({ headers: await headers() });
    } catch (e) {
        console.warn('Failed to get session in layout', e);
        // Provide minimal fallback to avoid build crash
        session = { user: { id: '', name: '' } };
    }
    if (!session?.user) redirect("/sign-in");

    let userInfo: any = {};
try {
    userInfo = await getUserInfo();
} catch (e) {
    console.warn('Failed to fetch user info in layout', e);
}

    const isFootball = userInfo?.screenJson?.isFootballClub ?? false;
    const isGolf = (userInfo?.screenJson?.isGolfClub && userInfo?.screenJson?.CanEditHoles) ?? false;
    const hasCheckIn = userInfo?.screenJson?.hasCheckInFunctionality ?? false;

    const loadedScreen = userInfo?.loadedScreen ?? "";
    const cookieStore = await cookies();
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    const [variant, collapsible] = await Promise.all([
        getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
        getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
    ]);

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar
                variant={variant}
                collapsible={collapsible}
                loadedScreen={loadedScreen}
                subScreenTypes={{ isFootball, isGolf, hasCheckIn }}
                user={session?.user}
            />

            <SidebarInset
                className={cn(
                    "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
                    "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!"
                )}
            >
                {/* Header */}
                <header
                    className={cn(
                        "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
                        "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md"
                    )}
                >
                    <div className="flex w-full items-center justify-between px-4 lg:px-6">
                        <div className="flex items-center gap-1 lg:gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

                            {loadedScreen && <ApplyDialog />}
                            {loadedScreen && <DiscardDialog />}
                            {loadedScreen && <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />}
                            {loadedScreen && (
                                <ScreenCollaborators
                                    screenName={loadedScreen}
                                    accountLogin={userInfo.loadedAccount}
                                />
                            )}
                            {loadedScreen && <GlobalSSEListener screenName={loadedScreen} userId={userInfo.userId} fullName={userInfo.fullName || "Unknown"} />}

                        </div>

                        <div className="flex items-center gap-2">
                            <LayoutControls />
                            <div className="hidden sm:flex">
                                <ThemeSwitcher />
                            </div>

                            <AccountSwitcher userName={userInfo.fullName} userRole={userInfo.role} />
                            {/* Preview toggle button */}
                            {loadedScreen && <PreviewTrigger/>}
                        </div>
                    </div>
                </header>

                <div className="flex h-[calc(100vh-4rem)] relative">
                    <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
                    <PreviewPanel loadedScreen={loadedScreen} />

                </div>


                {/* Floating Guide Menu*/}
                <div className="fixed bottom-4 right-4 z-50">
                    <GuideMenu />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
