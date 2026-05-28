'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PreviewScreen from '@/components/demo/PreviewScreen'
import {getUserInfo} from "@/lib/actions/user.actions";

export function PreviewToggle() {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-6">
            <Button onClick={() => setOpen((prev) => !prev)} className="z-50">
                {open ? 'Hide Preview' : 'Show Preview'}
            </Button>

            {/* Keep mounted, just toggle visibility */}
            <div className={
                open
                    ? 'fixed inset-0 bg-black/50 flex items-center justify-center z-40'
                    : 'hidden'
            } >
                <PreviewScreen />
            </div>
        </div>
    )
}
