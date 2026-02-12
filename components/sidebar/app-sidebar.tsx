"use client";

import Link from "next/link";
import Image from "next/image";
import { useShallow } from "zustand/react/shallow";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain, SubScreenTypes } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({
                               loadedScreen,
                               subScreenTypes,
                               user,
                               ...props
                           }: React.ComponentProps<typeof Sidebar> & {
    loadedScreen: string;
    subScreenTypes?: SubScreenTypes;
    user: any;
}) {
    const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
        useShallow((s) => ({
            sidebarVariant: s.sidebarVariant,
            sidebarCollapsible: s.sidebarCollapsible,
            isSynced: s.isSynced,
        }))
    );

    const { isMobile, setOpenMobile} = useSidebar();

    const variant = isSynced ? sidebarVariant : props.variant;
    const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

    const handleItemSelect = () => {
        if (isMobile) {
            setOpenMobile(false); // closes the sidebar
        }
    };

    return (
        <Sidebar {...props} variant={variant} collapsible={collapsible}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link prefetch={false} href="/dashboard/home">
                                <Image
                                    src="/assets/icons/logo.png"
                                    alt="logo"
                                    width={140}
                                    height={32}
                                    className="h-8 w-auto"
                                />
                                <span className="font-semibold text-base">
                  {APP_CONFIG.name}
                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={sidebarItems}
                    loadedScreen={loadedScreen}
                    subScreenTypes={subScreenTypes}
                    onItemSelect={handleItemSelect}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser userName={user.name} userEmail={user.email} />
            </SidebarFooter>
        </Sidebar>
    );
}