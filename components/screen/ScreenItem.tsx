"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useDirtyState } from "@/stores/user-store";
import { getScreenPreview } from "@/lib/actions/file.actions";

export function ScreenItem({
                               screenName,
                               loadedScreen,
                               onLoadScreen,
                               compact,
                           }: {
    screenName: string;
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
    compact: boolean;
}) {
    const { dirty, setDirty } = useDirtyState();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const ref = useRef<HTMLDivElement | null>(null);

    const isLoaded = loadedScreen === screenName;

    // Compact mode styles
    const cardSize = compact ? "p-2 gap-2 text-xs" : "p-4 gap-4 text-base";
    const buttonSize = compact ? "h-7 text-xs" : "h-10 text-sm";

    // Width controls ratio size
    const previewWidth = compact ? "w-[70px]" : "w-full";

    // Lazy load image
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        async function fetchImage() {
            try {
                const url = await getScreenPreview(screenName);
                setImageUrl(url);
            } catch (err) {
                console.error("Failed to load image:", err);
                setImageUrl(null);
            }
        }

        fetchImage();
    }, [isVisible, screenName]);

    async function handleLoad() {
        setIsLoading(true);

        try {
            await onLoadScreen(screenName);
            setDirty(false);
        } finally {
            setIsLoading(false);
            setOpen(false);
        }
    }

    function handleClick() {
        if (dirty && !isLoaded) {
            setOpen(true);
        } else {
            handleLoad();
        }
    }

    return (
        <div
            ref={ref}
            className={`border rounded-lg flex flex-col shadow-sm transition ${cardSize} ${
                isLoaded ? "bg-muted border-primary/30" : "bg-card"
            }`}
        >
            <p className="font-semibold text-center break-all">{screenName}</p>

            {/* Ratio-safe preview */}
            <div className="flex justify-center">
                <div
                    className={`relative group rounded-md overflow-hidden bg-muted ${previewWidth}`}
                >
                    <div className="aspect-[9/16] w-full">
                        <img
                            src={imageUrl ?? "/placeholder-9x16.png"}
                            alt={screenName}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-9x16.png";
                            }}
                        />
                    </div>
                </div>
            </div>

            <Button
                className={`w-full ${buttonSize}`}
                variant={isLoaded ? "secondary" : "default"}
                disabled={isLoaded || isLoading}
                onClick={handleClick}
            >
                {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                {isLoaded ? "Loaded" : isLoading ? "Loading..." : "Load"}
            </Button>

            <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unsaved Changes</DialogTitle>
                        <DialogDescription>
                            Loading a new screen will discard your unsaved changes. Continue?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleLoad}
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Loading..." : "Continue"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}