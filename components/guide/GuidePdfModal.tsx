"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, Maximize2, FileText, ExternalLink } from "lucide-react";

interface GuidePdfModalProps {
  src: string;
  title: string;
  description?: string;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
}

export function GuidePdfModal({
  src,
  title,
  description = "Official PDF walkthrough guide",
  triggerLabel,
  triggerVariant = "outline",
  children,
}: GuidePdfModalProps) {
  // 0 = normal, 1 = large, 2 = full-screen
  const [mode, setMode] = React.useState<0 | 1 | 2>(0);

  const setNormal = () => setMode(0);
  const setLarge = () => setMode(1);
  const setFull = () => setMode(2);

  const sizeClasses =
    mode === 0
      ? "w-[90vw] md:w-[70vw] h-[80vh]"
      : mode === 1
      ? "w-[95vw] md:w-[85vw] h-[88vh]"
      : "w-[98vw] h-[95vh]";

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant={triggerVariant} className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{triggerLabel || "View PDF Guide"}</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={`p-0 flex flex-col transition-all sm:max-w-none ${sizeClasses}`}
      >
        <DialogHeader className="px-6 pt-5 pb-3 border-b flex flex-row items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{title}</span>
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs mt-0.5">
                {description}
              </DialogDescription>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1 bg-muted p-1 rounded-md">
              <Button
                variant={mode === 0 ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={setNormal}
                title="Default view size"
              >
                <ZoomOut className="h-3.5 w-3.5 mr-1" />
                Default
              </Button>

              <Button
                variant={mode === 1 ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={setLarge}
                title="Large view size"
              >
                <ZoomIn className="h-3.5 w-3.5 mr-1" />
                Large
              </Button>

              <Button
                variant={mode === 2 ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={setFull}
                title="Fullscreen size"
              >
                <Maximize2 className="h-3.5 w-3.5 mr-1" />
                Fullscreen
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => window.open(src, "_blank")}
              title="Open PDF in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open File</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-neutral-900/5 overflow-hidden">
          <iframe
            src={src}
            width="100%"
            height="100%"
            allow="fullscreen"
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
