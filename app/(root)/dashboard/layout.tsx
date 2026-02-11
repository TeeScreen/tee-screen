import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { users } from "@/data/users";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { cn } from "@/lib/utils";
import { getPreference } from "@/lib/actions/server-actions";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AccountSwitcher } from "@/components/sidebar/account-switcher";
import { LayoutControls } from "@/components/sidebar/layout-controls";
import { ThemeSwitcher } from "@/components/sidebar/theme-switcher";
import {redirect} from "next/navigation";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/dist/server/request/headers";
import {getUserInfo} from "@/lib/actions/user.actions";
import { ApplyDialog } from "@/components/ApplyDialogue";
import { DiscardDialog } from "@/components/DiscardDialogue";
import {SubScreenTypes} from "@/components/sidebar/nav-main";
import {UnsavedChangesGuard} from "@/components/UnsavedChangesGuard";

export const dynamic = "force-dynamic";
export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {

  const session = await auth.api.getSession({headers: await headers()})
  if(!session?.user) redirect("/sign-in");

  const userInfo = await getUserInfo();

  const isFootball = userInfo?.screenJson?.isFootballClub ?? false;
  const isGolf = (userInfo?.screenJson?.isGolfClub && userInfo?.screenJson?.CanEditHoles) ?? false;

  const loadedScreen = userInfo?.loadedScreen ?? "";
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const [variant, collapsible] = await Promise.all([
    getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
  ]);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant={variant}
                  collapsible={collapsible}
                  loadedScreen={loadedScreen}
                  subScreenTypes={{isFootball, isGolf,}}
                  user={session?.user}
      />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
          // Adds right margin for inset sidebar in centered layout up to 113rem.
          // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
          "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!",
        )}
      >
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
            "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
              {loadedScreen && (
                  <ApplyDialog/>
              )}
              {loadedScreen && (
                  <DiscardDialog/>
              )}
            </div>
            <div className="flex items-center gap-2">
              <LayoutControls />
              <ThemeSwitcher />
              <AccountSwitcher userName={userInfo.fullName} userRole={userInfo.role}/>
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
