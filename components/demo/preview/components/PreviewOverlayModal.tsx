'use client'

import React, {memo} from 'react'
import Image from 'next/image'
import type {OverlayContent} from '../types'
import dynamic from "next/dynamic";
import {PreviewHandicapCalculator} from "@/components/demo/preview/components/PreviewHandicap";

const PreviewGolfMap = dynamic(() => import("./PreviewGolfMap"), {
    ssr: false,
    loading: () => <div className="p-6">Loading map…</div>,
});

interface PreviewOverlayModalProps {
    overlayContent: OverlayContent | null
    onClose: () => void
    onClearScreensaver: () => void
}

export const PreviewOverlayModal = memo(function PreviewOverlayModal({
                                                                         overlayContent,
                                                                         onClose,
                                                                         onClearScreensaver,
                                                                     }: PreviewOverlayModalProps) {
    if (!overlayContent) return null

    const getSafeUrl = (url: string) => {
        // If it's a YouTube watch URL, convert it to embed
        const ytMatch = url.match(/v=([^&]+)/);
        if (ytMatch) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }

        return url; // fallback for other URLs
    };

    switch (overlayContent.type) {
        case 'url':
            return (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <iframe
                        src={getSafeUrl(overlayContent.src)}
                        className="w-full h-full bg-white"
                    />
                    <button
                        className="absolute top-4 right-4 bg-red-600 text-white rounded-full h-[3.5vh] w-[3.5vh] flex items-center justify-center font-bold text-[1.5vh]"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            );

        case 'full':
            return (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <Image
                        src={overlayContent.src}
                        alt="full overlay"
                        fill
                        sizes="(max-height: 1080px) 56vh, 100vh"
                        className="w-full h-full bg-white object-contain"
                    />
                    <button
                        className="absolute top-24 right-4 bg-red-600 text-white rounded-full h-[3.5vh] w-[3.5vh] flex items-center justify-center font-bold text-[1.5vh]"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            )

        case 'fbImg':
            return (
                <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
                    <Image
                        src={overlayContent.src}
                        alt="full overlay"
                        fill
                        sizes="(max-height: 1080px) 56vh, 100vh"
                        className="w-full h-full bg-white object-contain"
                    />
                    <Image
                        src="/assets/demo/football/squad.png"
                        alt="squad overlay"
                        fill
                        sizes="(max-height: 1080px) 56vh, 100vh"
                        className="w-full h-full object-contain"
                    />
                    <button
                        className="absolute top-24 right-4 bg-red-600 text-white rounded-full h-[3.5vh] w-[3.5vh] flex items-center justify-center font-bold text-[1.5vh]"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            )

        case 'fbUrl':
            return (
                <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
                    <iframe
                        src={overlayContent.src}
                        className="w-full h-full bg-white"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                    <button
                        className="absolute top-4 right-4 bg-red-600 text-white rounded-full h-[3.5vh] w-[3.5vh] flex items-center justify-center font-bold text-[1.5vh]"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            )

        case 'fbPdf':
            return (
                <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
                    <iframe
                        src={`${overlayContent.src}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute inset-0 w-full h-full"
                        style={{border: "none"}}
                    />
                    <button
                        className="absolute top-4 right-4 bg-red-600 text-white rounded-full h-[3.5vh] w-[3.5vh] flex items-center justify-center font-bold text-[1.5vh]"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>
            )

        case 'ssImage':
            return (
                <div className="absolute top-[10%] left-0 right-0 z-50 flex items-center justify-center px-4">
                    <div className="w-full aspect-square relative">
                        <button onClick={onClearScreensaver} className="w-full h-full block relative">
                            <Image
                                src={overlayContent.src}
                                alt="Screensaver"
                                fill
                                sizes="(max-height: 1080px) 56vh, 100vh"
                                className="object-contain"
                            />
                        </button>
                    </div>
                </div>
            )

        case 'ssVid':
            return (
                <div className="absolute top-[10%] left-0 right-0 z-50 flex items-center justify-center px-4">
                    <div className="w-full aspect-square relative">
                        <button onClick={onClearScreensaver} className="w-full h-full block relative">
                            <video
                                src={overlayContent.src}
                                autoPlay
                                muted
                                className="absolute inset-0 w-full h-full object-contain"
                            />
                        </button>
                    </div>
                </div>
            )

        case 'golfHole':
            if (overlayContent.hole && overlayContent.tees) {
                return (
                    <div className="absolute h-full top-0 bottom-0 left-0 right-0 z-50 ">
                        <PreviewGolfMap
                            golfHole={overlayContent?.hole}
                            teeData={overlayContent?.tees}
                            onClose={onClose}
                        />
                    </div>
                )
            }
            break;

        case 'handicap':
            if(overlayContent.handicapData) {
                return (
                    <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
                        <PreviewHandicapCalculator
                            handicapData={overlayContent.handicapData}
                            onClose={onClose}
                        />
                    </div>
                )
            }
            break;


        default:
            return null
    }
})
