import {
  ALargeSmall, BadgeCheck,
  Bug, Contact,
  Eye,
  Flag,
  Home, ImageUp,
  type LucideIcon, NotebookTabs,
  PanelsTopLeft, PanelTopBottomDashed,
  Wallpaper,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  needsLoad?: boolean;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      {
        title: "Home",
        url: "/dashboard/home",
        icon: Home,
      },
      {
        title: "Logo",
        url: "/dashboard/logo",
        icon: ImageUp,
        needsLoad: true,
      },
      {
        title: "Overview",
        url: "/dashboard/overview",
        icon: PanelsTopLeft,
        needsLoad: true,
      },
      {
        title: "Background",
        url: "/dashboard/background",
        icon: Wallpaper,
        needsLoad: true,
      },
      {
        title: "UI Elements",
        url: "/dashboard/ui-elements",
        icon: PanelTopBottomDashed,
        needsLoad: true,
      },
      {
        title: "Notice Board",
        url: "/dashboard/notice-board",
        icon: Flag,
        needsLoad: true,
      },
      {
        title: "Custom Tabs",
        url: "/dashboard/custom-tabs",
        icon: NotebookTabs,
        needsLoad: true,
      },
      {
        title: "Screensavers",
        url: "/dashboard/screensavers",
        icon: Eye,
        needsLoad: true,
      },
    ],
  },
  {
    id: 2,
    label: "Pages",
    items: [
      {
        title: "Account Settings",
        url: "/pages/settings",
        icon: BadgeCheck,
      },
      {
        title: "Report Bug",
        url: "/pages/reportBug",
        icon: Bug,
      },
      {
        title: "Contact Us",
        url: "/pages/contact",
        icon: Contact,
      },

    ],
  },
];
