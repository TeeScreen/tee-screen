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

import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface GuideDialogProps {
    src: string;
    triggerLabel: string;
    title?: string;
    description?: string;
}

export function GuideDialog({
                                src,
                                triggerLabel,
                                title = "Guide",
                                description = "Step-by-step walkthrough",
                            }: GuideDialogProps) {
    // 0 = normal, 1 = large, 2 = full-screen
    const [mode, setMode] = React.useState<0 | 1 | 2>(0);

    const setNormal = () => setMode(0);
    const setLarge = () => setMode(1);
    const setFull = () => setMode(2);

    const sizeClasses =
        mode === 0
            ? "w-[60vw] h-[70vh]"
            : mode === 1
                ? "w-[85vw] h-[85vh]"
                : "w-[98vw] h-[95vh]";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{triggerLabel}</Button>
            </DialogTrigger>

            <DialogContent
                className={`p-0 flex flex-col transition-all sm:max-w-none ${sizeClasses}`}
            >
                <DialogHeader className="px-6 pt-6 pb-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant={mode === 0 ? "default" : "secondary"}
                            size="icon"
                            onClick={setNormal}
                            title="Normal size"
                        >
                            <ZoomOut className="h-5 w-5" />
                        </Button>

                        <Button
                            variant={mode === 1 ? "default" : "secondary"}
                            size="icon"
                            onClick={setLarge}
                            title="Large size"
                        >
                            <ZoomIn className="h-5 w-5" />
                        </Button>

                        <Button
                            variant={mode === 2 ? "default" : "secondary"}
                            size="icon"
                            onClick={setFull}
                            title="Full size"
                        >
                            <Maximize2 className="h-5 w-5" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <iframe
                        src={src}
                        width="100%"
                        height="100%"
                        allow="fullscreen"
                        style={{ border: 0, minHeight: "100%" }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}