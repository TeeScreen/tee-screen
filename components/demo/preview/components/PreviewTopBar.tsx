'use client'

import React, { useState, useEffect, memo } from 'react'
import Image from 'next/image'

interface PreviewTopBarProps {
    showTopSection: boolean
    uiColor: string
    textColor: string
    font: string
    logoImage: string | null
}

export const PreviewTopBar = memo(function PreviewTopBar({
    showTopSection,
    uiColor,
    textColor,
    font,
    logoImage,
}: PreviewTopBarProps) {
    const [currentTime, setCurrentTime] = useState<Date>(() => new Date())

    useEffect(() => {
        // Ticking interval isolated to TopBar
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 10000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div
            className={`w-full h-[10%] px-4 grid grid-cols-3 items-center border-b rounded-b-md relative z-30 -mb-[1.3%] ${
                showTopSection ? '' : 'opacity-0'
            }`}
            style={{ backgroundColor: uiColor }}
        >
            {/* LEFT — TIME + DATE */}
            <div className="flex flex-col justify-center h-full items-center left-0">
                <div className={`${font} ${textColor} text-[4vh] font-semibold leading-none py-1`}>
                    {currentTime.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    })}
                </div>

                <div className={`${font} ${textColor} text-[1vh] font-medium leading-none`}>
                    {currentTime.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long"
                    })}
                </div>
            </div>

            {/* CENTER — LOGO */}
            <div className="flex justify-center items-center h-[90%]">
                {logoImage && (
                    <div className="relative h-full aspect-square">
                        <Image
                            src={logoImage}
                            alt="Club Logo"
                            fill
                            sizes="(max-height: 1080px) 10vh, 15vh"
                            className="object-contain p-1"
                        />
                    </div>
                )}
            </div>

            {/* RIGHT — WEATHER */}
            <div className="flex justify-end items-center">
                <div className={`${font} text-[1.5vh] ${textColor} flex flex-col items-end leading-tight`}>
                    <span>19°C</span>
                    <span>6.35 mph</span>
                    <span>broken clouds</span>
                </div>
            </div>
        </div>
    )
})
