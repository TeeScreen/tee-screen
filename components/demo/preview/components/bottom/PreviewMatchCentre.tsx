'use client'

import React, { memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { OverlayContent } from '../../types'

interface PreviewMatchCentreProps {
    replaceNews: boolean
    footballNews: string
    lineUpBG: string | null
    fanGuidePDF: string | null
    hideMatchCentre: boolean
    hideScoreBG: string | null
    homeBG: string | null
    awayBG: string | null
    logoImage: string | null
    onOpenOverlay: (overlay: OverlayContent) => void
}

export const PreviewMatchCentre = memo(function PreviewMatchCentre({
    replaceNews,
    footballNews,
    lineUpBG,
    fanGuidePDF,
    hideMatchCentre,
    hideScoreBG,
    homeBG,
    awayBG,
    logoImage,
    onOpenOverlay,
}: PreviewMatchCentreProps) {
    const buttons = [
        { name: 'League Tables', icon: '/assets/demo/football/LeagueTable.png', disabled: true },
        { name: 'Live Scores', icon: '/assets/demo/football/LiveScore.png', disabled: true },
        {
            name: 'Lineups',
            icon: '/assets/demo/football/LineUp.png',
            disabled: false,
            type: 'fbImg' as const,
            src: lineUpBG ?? "/assets/demo/backups/LineUpBG.png",
        },
        replaceNews
            ? {
                name: 'Fan Guide',
                icon: '/assets/demo/football/FanGuide.png',
                disabled: false,
                type: 'fbPdf' as const,
                src: fanGuidePDF ?? "https://www.datocms-assets.com/43623/1689861809-the-ifab_football-rules_a-z.pdf",
            }
            : {
                name: 'News',
                icon: '/assets/demo/football/News.png',
                disabled: false,
                type: 'fbUrl' as const,
                src: footballNews,
            },
    ]

    return (
        <div className="w-full h-full bg-neutral-600 overflow-hidden relative">
            {/* TOP ROW — 4 fixed buttons */}
            <div className="grid grid-cols-4 h-1/3">
                {buttons.map((btn, i) => (
                    <button
                        key={i}
                        disabled={btn.disabled}
                        className={cn(
                            "w-full h-full bg-neutral-700 text-neutral-100 text-[9px] font-semibold flex flex-col items-center justify-center px-1",
                            btn.disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => {
                            if (btn.disabled || !btn.type || !btn.src) return
                            onOpenOverlay({ type: btn.type, src: btn.src })
                        }}
                    >
                        <div className="relative w-[60%] h-[60%] mb-1">
                            <Image
                                src={btn.icon}
                                alt={btn.name}
                                fill
                                sizes="(max-height: 1080px) 4vh, 6vh"
                                className="object-contain"
                            />
                        </div>
                        <span className="leading-tight text-[1vh] max-w-[90%]">{btn.name}</span>
                    </button>
                ))}
            </div>

            {hideMatchCentre && hideScoreBG ? (
                <div className="absolute bottom-0 left-0 w-full h-[67%]">
                    <Image
                        src={hideScoreBG}
                        alt="Home Team"
                        fill
                        sizes="(max-height: 1080px) 18vh, 25vh"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div>
                    {/* Overlay block */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/4 h-[63%] bg-neutral-700 text-neutral-100 flex flex-col items-center justify-center text-xs font-semibold z-20 rounded-b-2xl space-y-1">
                        <span>Venue Name</span>
                        <span>010:10</span>
                    </div>

                    {/* HOME + AWAY side by side */}
                    <div className="absolute bottom-0 left-0 w-full h-[67%] grid grid-cols-2">
                        {/* HOME */}
                        <div className="relative overflow-hidden">
                            {homeBG ? (
                                <Image
                                    src={homeBG}
                                    alt="Home Background"
                                    fill
                                    sizes="(max-height: 1080px) 18vh, 25vh"
                                    className="object-cover"
                                />
                            ) : logoImage ? (
                                <div className="absolute inset-0 flex items-center justify-end">
                                    <div className="relative w-70 h-70">
                                        <Image
                                            src={logoImage}
                                            alt="Home Team Logo"
                                            fill
                                            sizes="(max-height: 1080px) 12vh, 18vh"
                                            className="object-cover opacity-20 bg-black/90"
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {logoImage && (
                                <div className="absolute left-0 inset-0 flex items-center px-4">
                                    <div className="relative h-20 w-20">
                                        <Image
                                            src={logoImage}
                                            alt="Home Team"
                                            fill
                                            sizes="(max-height: 1080px) 8vh, 12vh"
                                            className="object-contain object-left"
                                        />
                                    </div>
                                    <span className="text-6xl font-extrabold text-neutral-100 drop-shadow-2xl">2</span>
                                </div>
                            )}
                        </div>

                        {/* AWAY */}
                        <div className="relative overflow-hidden">
                            {awayBG ? (
                                <Image
                                    src={awayBG}
                                    alt="Away Background"
                                    fill
                                    sizes="(max-height: 1080px) 18vh, 25vh"
                                    className="object-cover"
                                />
                            ) : logoImage ? (
                                <div className="absolute inset-0 flex items-center justify-start">
                                    <div className="relative w-70 h-70">
                                        <Image
                                            src={logoImage}
                                            alt="Away Team Logo"
                                            fill
                                            sizes="(max-height: 1080px) 12vh, 18vh"
                                            className="object-cover opacity-20 bg-black/90"
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {logoImage && (
                                <div className="absolute inset-0 flex items-center justify-end px-4">
                                    <span className="text-6xl font-extrabold text-neutral-100 drop-shadow-2xl mr-4">1</span>
                                    <div className="relative h-20 w-20">
                                        <Image
                                            src={logoImage}
                                            alt="Away Team"
                                            fill
                                            sizes="(max-height: 1080px) 8vh, 12vh"
                                            className="object-contain object-right"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
})
