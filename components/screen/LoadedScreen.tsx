"use client";

import { useEffect, useRef, useState } from "react";
import { getScreenPreview } from "@/lib/actions/file.actions";

export function LoadedScreen({ screenName }: { screenName: string }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const ref = useRef<HTMLDivElement | null>(null);

    // Lazy load when visible
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

    // Fetch preview image
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

    return (
        <div
            ref={ref}
            className="
                border rounded-lg shadow-sm bg-card
                p-2 gap-2 text-xs
                flex flex-col items-center
                w-full
            "
        >
            {/* Title */}
            <p className="font-semibold text-center break-all">
                Currently Editing: {screenName}
            </p>

            {/* Compact ratio-safe preview */}
            <div className="flex justify-center">
                <div className="relative rounded-md overflow-hidden bg-muted w-50">
                    <div className="aspect-[9/16] w-full">
                        <img
                            src={imageUrl ?? "/placeholder-9x16.png"}
                            alt={screenName}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/placeholder-9x16.png";
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
