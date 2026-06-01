import {
  LandPlot, BadgeCheck,
  Bug, Contact,
  Eye,
  Flag,
  Home, ImageUp, Camera,
  type LucideIcon, NotebookTabs,
  PanelsTopLeft, PanelTopBottomDashed, Trophy,
  Wallpaper, FileQuestionMark, NotebookPen, ChartNoAxesCombined,
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
  isFootball?: boolean;
  isGolf?: boolean;
  hasCheckIn?: boolean;
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
        title: "Screens",
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
        isFootball: false,
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
      {
        title: "Match Centre",
        url: "/dashboard/match-centre",
        icon: Trophy,
        needsLoad: true,
        isFootball: true,
      },
      {
        title: "Golf Course",
        url: "/dashboard/golf-course",
        icon: LandPlot,
        needsLoad: true,
        isGolf: true,
      },
      {
        title: "Golf Check In",
        url: "/dashboard/golf-check-in",
        icon: NotebookPen,
        needsLoad: true,
        hasCheckIn: true,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: ChartNoAxesCombined,
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
        url: "/pages/bug-report",
        icon: Bug,
        comingSoon: true,
      },
      {
        title: "Contact Us",
        url: "/pages/contact",
        icon: Contact,
        comingSoon: true,
      },
      /*{
        title: "Demo Camera",
        url: "/pages/demo-camera",
        icon: Camera,
      },*/
    ],
  },
];
