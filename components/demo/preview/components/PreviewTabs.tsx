'use client'

import React, {memo} from 'react'
import Image from 'next/image'
import {Button} from '@/components/ui/button'
import type {OverlayContent, TabColor, TabItem} from '../types'

interface PreviewTabsProps {
    tabs: TabItem[]
    uiColor: string
    font: string
    setTabIconsToFill: boolean
    onOpenOverlay: (overlay: OverlayContent) => void
}

export const PreviewTabs = memo(function PreviewTabs({
                                                         tabs,
                                                         uiColor,

                                                         font,
                                                         setTabIconsToFill,
                                                         onOpenOverlay,
                                                     }: PreviewTabsProps) {
    if (!tabs || tabs.length === 0) return null

    const toCssRgba = (c?: TabColor): string | undefined => {
        // If no colour object, fall back to uiColor
        if (!c) return uiColor

        const {r, g, b, a} = c

        // If the colour is exactly {1,1,1,1}, fall back to uiColor
        if (r === 1 && g === 1 && b === 1 && a === 1) {
            return uiColor
        }

        // Normal RGBA conversion
        return `rgba(${r}, ${g}, ${b}, ${a / 255})`
    }




    const handleTabClick = (tab: TabItem) => {
        if (tab.urlActive && tab.url) {
            onOpenOverlay({type: "url", src: tab.url})
        } else if (tab.overlayImage) {
            const lower = tab.overlayImage.toLowerCase()
            if (lower.endsWith(".mp4")) {
                onOpenOverlay({type: "vid", src: tab.overlayImage})
            } else if (lower.endsWith(".pdf")) {
                onOpenOverlay({type: "pdf", src: tab.overlayImage})
            } else {
                onOpenOverlay({type: "image", src: tab.overlayImage})
            }
        }
    }

// Helper to extract r, g, b from an rgba() or rgb() CSS string
    const parseRgbaString = (colorStr: string): { r: number; g: number; b: number } | undefined => {
        const match = colorStr.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/i)
        if (!match) return undefined
        return {
            r: parseFloat(match[1]),
            g: parseFloat(match[2]),
            b: parseFloat(match[3])
        }
    }

    function getBrightness(color: { r: number; g: number; b: number }): number {
        let r = color.r
        let g = color.g
        let b = color.b

        // If it's the fallback sentinel, resolve it from uiColor
        if (r === 1 && g === 1 && b === 1) {
            const fallbackRgb = parseRgbaString(uiColor)
            if (fallbackRgb) {
                r = fallbackRgb.r
                g = fallbackRgb.g
                b = fallbackRgb.b
            } else {
                return 1 // Default fallback brightness if parsing fails
            }
        }

        // Calculate normalized brightness on a 0-255 scale
        return (r + g + b) / (3 * 255)
    }

    return (
        <div className="relative w-full px-2 z-30 -mt-[2%]">
            <div className="flex justify-center gap-2 w-full">
                {tabs.map((tab, i) => {
                    if (!tab.active) return null

                    const { r = 0, g = 0, b = 0 } = tab.colour ?? {}
                    const brightness = getBrightness({ r, g, b })
                    let textColor = brightness < 0.5 ? "text-neutral-100" : "text-neutral-900"

                    return (
                        <Button
                            key={i}
                            className="relative p-0 h-[8vh] flex-1 max-w-[25%] rounded-sm flex flex-col items-center justify-center"
                            style={{backgroundColor: toCssRgba(tab.colour)}}
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
                                            className="object-contain"
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
                    ) })}
            </div>
        </div>
    )
})
