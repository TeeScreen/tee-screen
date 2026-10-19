'use client'

import React, { memo } from 'react'
import { Button } from '@/components/ui/button'
import type { NoticeItem, OverlayContent } from '../../types'

interface PreviewNoticesBoardProps {
    notices: NoticeItem[]
    font: string
    onOpenOverlay: (overlay: OverlayContent) => void
}

export const PreviewNoticesBoard = memo(function PreviewNoticesBoard({
    notices,
    font,
    onOpenOverlay,
}: PreviewNoticesBoardProps) {
    function getBrightness(color: { r: number; g: number; b: number }) {
        return (color.r + color.g + color.b) / (3 * 255)
    }

    return (
        <div className="w-full h-full flex flex-col justify-end gap-[0.1vh]">
            {notices.map((notice, i) => {
                if (!notice.active) return null

                const { r = 0, g = 0, b = 0 } = notice.color ?? {}
                const brightness = getBrightness({ r, g, b })
                const textColorClass = brightness < 0.5 ? "text-neutral-100" : "text-neutral-900"

                return (
                    <Button
                        key={i}
                        className="max-h-[7.9vh] p-0 w-full flex-1 rounded-none flex items-center justify-center"
                        style={{
                            backgroundColor: `rgba(${r},${g},${b},${typeof notice.color?.a === 'number' ? notice.color.a / 255 : 1})`,
                        }}
                        onClick={() => {
                            if (notice.interactive) {
                                if (notice.urlActive && notice.url) {
                                    onOpenOverlay({ type: "url", src: notice.url })
                                } else if (notice.image) {
                                    if (notice.image.endsWith(".pdf")) {
                                        onOpenOverlay({ type: "pdf", src: notice.image })
                                    } else {
                                        onOpenOverlay({ type: "image", src: notice.image })
                                    }
                                }
                            }
                        }}
                    >
            <span
                className={`${font} ${textColorClass} text-[3vh] uppercase font-semibold text-center w-[85%] whitespace-normal break-words leading-[3vh]`}
            >
                {notice.text}
            </span>
                    </Button>
                )
            })}

        </div>
    )
})
