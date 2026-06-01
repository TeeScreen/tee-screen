'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PreviewScreen from '@/components/demo/PreviewScreen'
import {getUserInfo} from "@/lib/actions/user.actions";
import { Smartphone } from "lucide-react";

export function PreviewToggle() {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex items-center gap-6">
            <Button onClick={() => setOpen((prev) => !prev)} className="z-50">
                <Smartphone/><span className="hidden md:inline">{open ? 'Hide Preview' : 'Show Preview'}</span>
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
