'use client'

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'

interface PreviewGolfCourseProps {
    isGolfClub: boolean
    hideHolesOnScreen: boolean
    onSelectHole: (hole: number) => void
}

const FRONT_NINE = Array.from({ length: 9 }, (_, i) => i + 1)
const BACK_NINE = Array.from({ length: 9 }, (_, i) => i + 10)

export const PreviewGolfCourse = memo(function PreviewGolfCourse({
                                                                     isGolfClub,
                                                                     hideHolesOnScreen,
                                                                     onSelectHole,
                                                                 }: PreviewGolfCourseProps) {
    if (!isGolfClub || hideHolesOnScreen) {
        return null
    }

    return (
        <div className="absolute top-[52.5%] w-full px-4 z-20 flex flex-col gap-3 items-center">
            <div className="flex flex-col gap-[1vh]">

                {/* FRONT 1–9 */}
                <div className="grid grid-cols-9 gap-[2vh]">
                    {FRONT_NINE.map((hole) => (
                        <Button
                            key={hole}
                            className="h-[3vh] w-[3vh] rounded-full bg-white border border-black
                                       text-black text-[1.5vh] font-semibold p-0 flex items-center justify-center"
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
                            className="h-[3vh] w-[3vh] rounded-full bg-white border border-black
                                       text-black text-[1.5vh] font-semibold p-0 flex items-center justify-center"
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
