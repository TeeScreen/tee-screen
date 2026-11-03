'use client'

import React, {memo} from 'react'
import {Button} from '@/components/ui/button'
import {Colour, type TabColor} from "@/components/demo/preview";
import {RGBA} from "@/components/json/ColorInput";

interface PreviewGolfCourseProps {
    isGolfClub: boolean
    hideHolesOnScreen: boolean
    onSelectHole: (hole: number) => void
    holeColour: Colour
}

const FRONT_NINE = Array.from({length: 9}, (_, i) => i + 1)
const BACK_NINE = Array.from({length: 9}, (_, i) => i + 10)

export const PreviewGolfCourse = memo(function PreviewGolfCourse({
                                                                     isGolfClub,
                                                                     hideHolesOnScreen,
                                                                     onSelectHole,
                                                                     holeColour,
                                                                 }: PreviewGolfCourseProps) {
    if (!isGolfClub || hideHolesOnScreen) {
        return null
    }

    const toCssRgba = (c?: Colour): string | undefined => {
        // If no colour object, fall back to uiColor
        if (!c) return

        const {r, g, b, a} = c

        // If the colour is exactly {1,1,1,1}, fall back to uiColor
        if (r === 1 && g === 1 && b === 1 && a === 1) {
            return `rgba(${255}, ${255}, ${255}, ${255 / 255})`
        }

        // Normal RGBA conversion
        return `rgba(${r}, ${g}, ${b}, ${a / 255})`
    }
    function getBrightness(color: { r: number; g: number; b: number }) {
        if(color.r==1 && color.g==1 && color.b==1)return 1;
        return (color.r + color.g + color.b) / (3 * 255)
    }

    const brightness = getBrightness(holeColour)

    const hex = toCssRgba(holeColour);
    const textColorClass = brightness < 0.5 ? "text-neutral-100" : "text-neutral-900"


    return (
        <div className="absolute top-[52.5%] w-full px-4 z-20 flex flex-col gap-3 items-center">
            <div className="flex flex-col gap-[1vh]">

                {/* FRONT 1–9 */}
                <div className="grid grid-cols-9 gap-[2vh]">
                    {FRONT_NINE.map((hole) => (
                        <Button
                            key={hole}
                            className={`h-[3vh] w-[3vh] rounded-full border border-black
                                ${textColorClass} text-[1.5vh] font-semibold p-0 flex items-center justify-center`}
                            style={{backgroundColor: hex}}
                            onClick={() => onSelectHole(hole)}
                        >
                            {hole}
                        </Button>
                    ))}
                </div>

                {/* BACK 10–18 */}
                <div className="grid grid-cols-9 gap-[2vh]">
                    {BACK_NINE.map((hole) => (
                        <Button
                            key={hole}
                            className={`h-[3vh] w-[3vh] rounded-full border border-black
                                ${textColorClass}  text-[1.5vh] font-semibold p-0 flex items-center justify-center`}
                            style={{backgroundColor: hex}}
                            onClick={() => onSelectHole(hole)}
                        >
                            {hole}
                        </Button>
                    ))}
                </div>

            </div>
        </div>
    )
})
