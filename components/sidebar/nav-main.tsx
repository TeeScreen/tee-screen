"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { NavGroup, NavMainItem } from "@/navigation/sidebar/sidebar-items";

export interface SubScreenTypes {
  isFootball?: boolean;
  isGolf?: boolean;
  hasCheckIn?: boolean;
}

interface NavMainProps {
  readonly items: readonly NavGroup[];
  loadedScreen?: string;
  subScreenTypes?: SubScreenTypes;
  onItemSelect?: () => void; // <-- NEW
}

const IsComingSoon = () => (
    <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">
    Soon
  </span>
);

const NavItemExpanded = ({
                           item,
                           isActive,
                           isSubmenuOpen,
                           loadedScreen,
                           onItemSelect,
                         }: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
  loadedScreen: string;
  onItemSelect?: () => void;
}) => {
  const isLoaded = loadedScreen !== "";

  return (
      <Collapsible
          key={item.title}
          asChild
          defaultOpen={isSubmenuOpen(item.subItems)}
          className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            {item.subItems ? (
                <SidebarMenuButton
                    disabled={(item.needsLoad && !isLoaded) || item.comingSoon}
                    isActive={isActive(item.url, item.subItems)}
                    tooltip={item.title}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.comingSoon && <IsComingSoon />}
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
            ) : (
                <SidebarMenuButton
                    asChild
                    aria-disabled={(item.needsLoad && !isLoaded) || item.comingSoon}
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    onClick={onItemSelect}
                >
                  <Link
                      prefetch={false}
                      href={item.url}
                      target={item.newTab ? "_blank" : undefined}
                      onClick={onItemSelect}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.comingSoon && <IsComingSoon />}
                  </Link>
                </SidebarMenuButton>
            )}
          </CollapsibleTrigger>

          {item.subItems && (
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                            aria-disabled={subItem.comingSoon}
                            isActive={isActive(subItem.url)}
                            asChild
                        >
                          <Link
                              prefetch={false}
                              href={subItem.url}
                              target={subItem.newTab ? "_blank" : undefined}
                              onClick={onItemSelect}
                          >
                            {subItem.icon && <subItem.icon />}
                            <span>{subItem.title}</span>
                            {subItem.comingSoon && <IsComingSoon />}
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
          )}
        </SidebarMenuItem>
      </Collapsible>
  );
};

const NavItemCollapsed = ({
                            item,
                            isActive,
                            loadedScreen,
                            onItemSelect,
                          }: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  loadedScreen: string;
  onItemSelect?: () => void;
}) => {
  const isLoaded = loadedScreen !== "";

  return (
      <SidebarMenuItem key={item.title}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
                disabled={(item.needsLoad && !isLoaded) || item.comingSoon}
                tooltip={item.title}
                isActive={isActive(item.url, item.subItems)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-50 space-y-1" side="right" align="start">
            {item.subItems?.map((subItem) => (
                <DropdownMenuItem key={subItem.title} asChild>
                  <SidebarMenuSubButton
                      asChild
                      className="focus-visible:ring-0"
                      aria-disabled={subItem.comingSoon}
                      isActive={isActive(subItem.url)}
                  >
                    <Link
                        prefetch={false}
                        href={subItem.url}
                        target={subItem.newTab ? "_blank" : undefined}
                    >
                      {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  </SidebarMenuSubButton>
                </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
  );
};

export function NavMain({
                          items,
                          loadedScreen,
                          subScreenTypes,
                          onItemSelect,
                        }: NavMainProps) {
  const path = usePathname();
  const { state, isMobile } = useSidebar();

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url));
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) =>
      subItems?.some((sub) => path.startsWith(sub.url)) ?? false;

  const screenName = loadedScreen ?? "";

  return (
      <>
        {items.map((group) => (
            <SidebarGroup key={group.id}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}

              <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                  {group.items.map((item) => {
                    const matchesSubScreen =
                        (item.isFootball === undefined || item.isFootball === subScreenTypes?.isFootball) &&
                        (item.isGolf === undefined || item.isGolf === subScreenTypes?.isGolf) &&
                      (item.hasCheckIn === undefined || item.hasCheckIn === subScreenTypes?.hasCheckIn);

                    if (!matchesSubScreen) return null;

                    // Collapsed desktop
                    if (state === "collapsed" && !isMobile) {
                      if (!item.subItems) {
                        return (
                            <SidebarMenuItem key={item.title}>
                              <SidebarMenuButton
                                  asChild
                                  aria-disabled={item.comingSoon}
                                  tooltip={item.title}
                                  isActive={isItemActive(item.url)}
                              >
                                <Link
                                    prefetch={false}
                                    href={item.url}
                                    target={item.newTab ? "_blank" : undefined}
                                    onLoad={onItemSelect}
                                >
                                  {item.icon && <item.icon />}
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                      }

                      return (
                          <NavItemCollapsed
                              key={item.title}
                              item={item}
                              isActive={isItemActive}
                              loadedScreen={screenName}
                              onItemSelect={onItemSelect}
                          />
                      );
                    }

                    // Expanded
                    return (
                        <NavItemExpanded
                            key={item.title}
                            item={item}
                            isActive={isItemActive}
                            isSubmenuOpen={isSubmenuOpen}
                            loadedScreen={screenName}
                            onItemSelect={onItemSelect}
                        />
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
        ))}
      </>
  );
}