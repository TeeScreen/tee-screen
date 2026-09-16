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

export function FirstTimeUserGuideMenu() {
  const [activeTab, setActiveTab] = React.useState<"guides" | "video">("guides");
  const [isOpen, setIsOpen] = React.useState(false);

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
            <span className="hidden md:inline font-medium">First Time User</span>
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
                <span>User Manuals</span>
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
                <div className="flex flex-col gap-6 text-sm leading-relaxed">

                  <div className="p-4 rounded-md border bg-muted/30">
                    <h3 className="font-semibold text-base mb-2">First Time Using the New TeeScreen Portal?</h3>

                    <p className="text-muted-foreground">
                      The previous TeeScreen portal used <strong>direct screen account logins</strong> — each screen
                      had its own username and password, and users logged in to those accounts individually.
                    </p>

                    <p className="mt-3 text-muted-foreground">
                      The new portal works differently. You now create a <strong>personal account</strong>, and from
                      that account you can securely access and manage your screen accounts. This allows us to support
                      multiple users working on the same screens, provide better security, and offer more direct help
                      through our updated backend and support tools.
                    </p>

                    <p className="mt-3 text-muted-foreground">
                      Once your personal account is created, you can link your existing screen accounts and continue
                      working exactly as before — but with improved reliability, shared access, and modern security.
                    </p>
                  </div>

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
            Want to make your personal account?
          </span>
            <Button
                asChild
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setIsOpen(false)}
            >
              <Link href="/sign-up">
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

        </DialogContent>
      </Dialog>
  );
}