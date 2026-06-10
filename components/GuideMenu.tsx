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
  LandPlot,
  Users,
  HelpCircle,
} from "lucide-react";

export function GuideMenu() {
  const categories = [
    {
      name: "Essentials",
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
        {
          label: "Edit Your Screen",
          src: "/guides/HowToEdit.pdf",
          title: "How to Edit your Screen",
          description: "Overview of how to make changes and apply them to your screen",
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
          description: "Make changes to your user information",
        },
        {
          label: "Change Email or Password",
          src: "/guides/ChangeEmailAndPassword.pdf",
          title: "Change Email or Password",
          description: "Make secure changes to your email or password",
        },
      ],
    },
    {
      name: "Golf",
      icon: LandPlot,
      guides: [
        {
          label: "How to edit hole co-ordinates",
          src: "/guides/ChangingCoordinates.pdf",
          title: "Edit your Coordinates",
          description: "How to edit the co-ordinates for the interactive map",
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
            <DialogTitle>Exmaple for adding a screen login and making changes</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 mt-4">
            {/*}  {categories.map((cat, i) => {
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
            })}*/}

             <div className="w-full h-64 lg:h-[400px] flex items-center justify-center bg-black">
                    <video
                        src="/assets/video/VideoGuide.mp4"
                        className="max-w-full max-h-full object-contain"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                </div>


          </div>
        </DialogContent>
      </Dialog>
  );
}