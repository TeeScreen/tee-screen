'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import type { OverlayContent } from '../types'

interface PreviewOverviewProps {
    overviewImage: string | null
    overlayContent: OverlayContent | null
    onCloseOverlay: () => void
}

export const PreviewOverview = memo(function PreviewOverview({
    overviewImage,
    overlayContent,
    onCloseOverlay,
}: PreviewOverviewProps) {
    return (
        <div className="relative w-full aspect-square flex-shrink-0">
            {overviewImage && (
                <Image
                    src={overviewImage}
                    alt="Overview"
                    fill
                    priority
                    sizes="(max-height: 1080px) 56vh, 100vh"
                    className="object-contain"
                />
            )}

            {overlayContent?.type === 'image' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 -mt-[3%]">
                    <div className="w-full aspect-square relative">
                        <Image
                            src={overlayContent.src}
                            alt="Overlay"
                            fill
                            sizes="(max-height: 1080px) 56vh, 100vh"
                            className="object-contain"
                        />
                        <button
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-[3vh] w-[3vh] flex items-center justify-center font-bold text-[1.5vh]"
                            onClick={onCloseOverlay}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {overlayContent?.type === 'vid' && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 -mt-[3%]">
                    <div className="w-full aspect-square relative">
                        <video
                            src={overlayContent.src}
                            autoPlay={true}
                            muted={true}
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                        <button
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full h-[3vh] w-[3vh] flex items-center justify-center font-bold text-[1.5vh]"
                            onClick={onCloseOverlay}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {overlayContent?.type === 'pdf' && (
                <div className="absolute top-[10%] bottom-[-10%] left-[10%] right-[10%] z-50 flex items-center justify-center">
                    <iframe
                        src={`${overlayContent.src}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute inset-0 w-full h-full"
                        style={{ border: "none" }}
                    />
                    <button
                        className="absolute top-4 right-4 bg-red-600 text-white rounded-full h-[3vh] w-[3vh] flex items-center justify-center font-bold text-[1.5vh]"
                        onClick={onCloseOverlay}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    )
})
