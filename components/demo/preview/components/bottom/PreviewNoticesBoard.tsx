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
    return (
        <div className="w-full h-full flex flex-col justify-end gap-[0.1vh]">
            {notices.map((notice, i) =>
                notice.active ? (
                    <Button
                        key={i}
                        className="max-h-[7.9vh] p-0 w-full flex-1 rounded-none flex items-center justify-center"
                        style={{
                            backgroundColor: notice.color
                                ? `rgba(${notice.color.r ?? 0},${notice.color.g ?? 0},${notice.color.b ?? 0},${typeof notice.color.a === 'number' ? notice.color.a / 255 : 1})`
                                : 'transparent',
                        }}
                        onClick={() => {
                            if (notice.interactive) {
                                if (notice.urlActive && notice.url) {
                                    onOpenOverlay({ type: "url", src: notice.url })
                                } else if (notice.image) {
                                    onOpenOverlay({ type: "image", src: notice.image })
                                }
                            }
                        }}
                    >
                        <span className={`${font} text-[3vh] uppercase font-semibold text-center w-[85%] whitespace-normal break-words leading-[3vh]`}>
                            {notice.text}
                        </span>
                    </Button>
                ) : null
            )}
        </div>
    )
})
