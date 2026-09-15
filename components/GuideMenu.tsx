"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { GuidePdfModal } from "@/components/guide/GuidePdfModal";

import {
  BookOpen,
  LandPlot,
  Users,
  HelpCircle,
  Video,
  FileText,
  ExternalLink,
  BookMarked,
  ArrowRight,
} from "lucide-react";

export function GuideMenu() {
  const [activeTab, setActiveTab] = React.useState<"guides" | "video">("guides");
  const [isOpen, setIsOpen] = React.useState(false);

  const categories = [
    {
      name: "Essentials & First-Time Setup",
      icon: BookOpen,
      guides: [
        {
          label: "First-Time Setup: Connect Screen Account",
          src: "/guides/AddAndLoadAccountForEditing.pdf",
          title: "First-Time Setup & Connecting Screen Accounts",
          description: "Step-by-step for new users adding screen credentials in Account Settings",
        },
        {
          label: "Selecting & Loading Accounts",
          src: "/guides/AddAndLoadAccountForEditing.pdf",
          title: "Getting Started with Accounts",
          description: "Overview of system accounts, switching screens, and basic navigation",
        },
        {
          label: "Customise Dashboard Visuals",
          src: "/guides/ChangeVisuals.pdf",
          title: "Dashboard Customise Visuals",
          description: "Overview of customisation options, branding, and updating colors",
        },
        {
          label: "Edit Your Screen",
          src: "/guides/HowToEdit.pdf",
          title: "How to Edit your Screen",
          description: "Overview of making draft changes and applying them to physical screens",
        },
      ],
    },
    {
      name: "Users & Permissions",
      icon: Users,
      guides: [
        {
          label: "Change User Information",
          src: "/guides/HowtoChangeYourBasicAccountSettings.pdf",
          title: "Change User Information",
          description: "Make changes to your basic account settings and user profile",
        },
        {
          label: "Change Email or Password",
          src: "/guides/ChangeEmailAndPassword.pdf",
          title: "Change Email or Password",
          description: "Make secure changes to your account email address or password",
        },
      ],
    },
    {
      name: "Golf Features",
      icon: LandPlot,
      guides: [
        {
          label: "How to edit hole co-ordinates",
          src: "/guides/ChangingCoordinates.pdf",
          title: "Edit Hole Coordinates",
          description: "How to edit pin co-ordinates for the interactive satellite map",
        },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="
            flex items-center gap-2
            px-3 py-2
            rounded-full
            md:rounded-md
            shadow-lg
            hover:shadow-xl
            transition-all
          "
        >
          <HelpCircle className="h-5 w-5" />
          <span className="hidden md:inline font-medium">Help & Guides</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-3 border-b space-y-1 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" />
              <span>Documentation & Help Menu</span>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Quick access to video walkthroughs, PDF user manuals, and step-by-step guides.
          </DialogDescription>

          {/* Quick Tabs inside Dialog */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant={activeTab === "guides" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("guides")}
              className="h-8 text-xs gap-1.5 rounded-md"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>PDF User Manuals</span>
            </Button>

            <Button
              variant={activeTab === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("video")}
              className="h-8 text-xs gap-1.5 rounded-md"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Video Guide</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {activeTab === "guides" ? (
            <div className="flex flex-col gap-6">
              {categories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Icon className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">{cat.name}</h3>
                    </div>

                    <div className="flex flex-col gap-2 pl-6">
                      {cat.guides.map((g, j) => (
                        <div
                          key={j}
                          className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/60 transition-colors"
                        >
                          <div className="space-y-0.5 max-w-[320px]">
                            <p className="text-xs font-medium text-foreground">
                              {g.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">
                              {g.description}
                            </p>
                          </div>

                          <GuidePdfModal
                            src={g.src}
                            title={g.title}
                            description={g.description}
                            triggerLabel="Open PDF"
                            triggerVariant="outline"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border shadow-inner">
                <video
                  src="/assets/video/VideoGuide.mp4"
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Demonstration of adding a screen login, making changes, and applying updates.
              </p>
            </div>
          )}
        </div>

        {/* Footer Link to Full Documentation Page */}
        <div className="pt-3 border-t shrink-0 flex items-center justify-between bg-background">
          <span className="text-xs text-muted-foreground">
            Looking for full feature docs?
          </span>
          <Button
            asChild
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/pages/guide">
              <span>Open Full Documentation Center</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}