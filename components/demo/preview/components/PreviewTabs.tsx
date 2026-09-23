'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { TabItem, OverlayContent } from '../types'

interface PreviewTabsProps {
    tabs: TabItem[]
    uiColor: string
    textColor: string
    font: string
    setTabIconsToFill: boolean
    onOpenOverlay: (overlay: OverlayContent) => void
}

export const PreviewTabs = memo(function PreviewTabs({
    tabs,
    uiColor,
    textColor,
    font,
    setTabIconsToFill,
    onOpenOverlay,
}: PreviewTabsProps) {
    if (!tabs || tabs.length === 0) return null

    const handleTabClick = (tab: TabItem) => {
        if (tab.urlActive && tab.url) {
            onOpenOverlay({ type: "url", src: tab.url })
        } else if (tab.overlayImage) {
            const lower = tab.overlayImage.toLowerCase()
            if (lower.endsWith(".mp4")) {
                onOpenOverlay({ type: "vid", src: tab.overlayImage })
            } else if (lower.endsWith(".pdf")) {
                onOpenOverlay({ type: "pdf", src: tab.overlayImage })
            } else {
                onOpenOverlay({ type: "image", src: tab.overlayImage })
            }
        }
    }

    return (
        <div className="relative w-full px-2 z-30 -mt-[2%]">
            <div className="flex justify-center gap-2 w-full">
                {tabs.map((tab, i) => (
                    <Button
                        key={i}
                        className="relative p-0 h-[8vh] flex-1 max-w-[25%] rounded-sm flex flex-col items-center justify-center"
                        style={{ backgroundColor: uiColor }}
                        onClick={() => handleTabClick(tab)}
                    >
                        {setTabIconsToFill ? (
                            <>
                                {tab.icon && (
                                    <Image
                                        src={tab.icon}
                                        alt={`${tab.name} icon`}
                                        fill
                                        sizes="(max-height: 1080px) 8vh, 12vh"
                                        className="object-cover opacity-60"
                                    />
                                )}
                                <span
                                    className={`relative z-10 ${textColor} ${font} font-semibold text-center max-w-full px-1 text-[clamp(0.6rem,1.5vw,0.9rem)]`}
                                >
                                    {tab.name}
                                </span>
                            </>
                        ) : (
                            <>
                                {tab.icon ? (
                                    <div className="flex-1 w-full h-full flex top-0">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={tab.icon}
                                                alt={`${tab.name} icon`}
                                                fill
                                                sizes="(max-height: 1080px) 8vh, 12vh"
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                <span
                                    className={`${textColor} ${font} font-semibold text-center break-words whitespace-normal w-full ${
                                        tab.icon
                                            ? "flex-[0] bottom-0 text-[1vh] leading-tight"
                                            : "flex items-center justify-center h-full text-[2vh]"
                                    }`}
                                >
                                    {tab.name}
                                </span>
                            </>
                        )}
                    </Button>
                ))}
            </div>
        </div>
    )
})
