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
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{triggerLabel}</Button>
            </DialogTrigger>

            <DialogContent className="max-w-9xl w-full h-[80vh] p-0 flex flex-col">
                <DialogHeader className="px-6 pt-6 pb-3">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
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