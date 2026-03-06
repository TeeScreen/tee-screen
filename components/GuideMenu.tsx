"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { GuideDialog } from "./GuideDialog";

import {
  BookOpen,
  Settings,
  Users,
  Wrench,
  HelpCircle,
} from "lucide-react";

export function GuideMenu() {
  const categories = [
    {
      name: "Basics",
      icon: BookOpen,
      guides: [
        {
          label: "Add and Load Accounts",
          src: "/guides/AddAndLoadAccountForEditing.pdf",
          title: "Getting Started",
          description: "Overview of the system and basic navigation",
        },
        {
          label: "Customise Dashboard Visuals",
          src: "/guides/ChangeVisuals.pdf",
          title: "Dashboard Customise Visuals",
          description: "Overview of customisation options and how to update them",
        },
      ],
    },
    {
      name: "Management",
      icon: Settings,
      guides: [
        {
          label: "Managing Bookings",
          src: "/guides/managing-bookings.pdf",
          title: "Managing Bookings",
          description: "How to view, edit, and manage bookings",
        },
        {
          label: "Court & Facility Settings",
          src: "/guides/facility-settings.pdf",
          title: "Facility Settings",
          description: "Configure courts, schedules, and availability",
        },
      ],
    },
    {
      name: "Users & Permissions",
      icon: Users,
      guides: [
        {
          label: "User Permissions",
          src: "/guides/user-permissions.pdf",
          title: "User Permissions",
          description: "Understanding roles and access levels",
        },
        {
          label: "Managing Members",
          src: "/guides/managing-members.pdf",
          title: "Managing Members",
          description: "Add, edit, and manage member accounts",
        },
      ],
    },
    {
      name: "Troubleshooting",
      icon: Wrench,
      guides: [
        {
          label: "Common Issues",
          src: "/guides/troubleshooting.pdf",
          title: "Troubleshooting",
          description: "Common issues and how to resolve them",
        },
      ],
    },
  ];

  return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
              className="
            flex items-center gap-2
            px-3 py-2
            rounded-full
            md:rounded-md
          "
          >
            <HelpCircle className="h-5 w-5" />
            <span className="hidden md:inline">Help</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Guides</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 mt-4">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">{cat.name}</h3>
                    </div>

                    <div className="flex flex-col gap-2 pl-7">
                      {cat.guides.map((g, j) => (
                          <GuideDialog
                              key={j}
                              src={g.src}
                              triggerLabel={g.label}
                              title={g.title}
                              description={g.description}
                          />
                      ))}
                    </div>
                  </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
  );
}