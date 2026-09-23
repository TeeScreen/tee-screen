'use client'

import React, { memo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { InfoIcon } from 'lucide-react'
import type { NoticeItem, ScheduleEntry } from '../types'
import {nowUnityIsoString, toUnityIsoStringFrom, toUnityIsoStringFromString} from "@/lib/helper";

interface PreviewInfoProps {
    scheduleActive: boolean
    activeScheduleEntry: ScheduleEntry | null
    notices: NoticeItem[]
}

export const PreviewInfo = memo(function PreviewInfo({
                                                         scheduleActive,
                                                         activeScheduleEntry,
                                                         notices,
                                                     }: PreviewInfoProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Info Button */}
            <div className="absolute bottom-10 left-0 z-[100] p-1 h-[5%] w-full flex justify-start">
                <Button variant="outline" onClick={() => setOpen(true)}>
                    <InfoIcon />
                </Button>
            </div>

            {/* Info Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Screen Information</DialogTitle>
                    </DialogHeader>

                    <Card className="p-4 space-y-6">

                        {/* HOW THE SCREEN WORKS */}
                        <section>
                            <h3 className="font-semibold text-lg mb-2">How Everything Works</h3>
                            <ul className="space-y-2 text-sm leading-relaxed">
                                <li><strong>Top Bar:</strong> Shows the club logo and brand colour.</li>
                                <li><strong>Overview Image:</strong> Main hero image; can open overlays.</li>
                                <li><strong>Tabs:</strong> Open images, videos, PDFs, or external links.</li>
                                <li><strong>Golf Section:</strong> If enabled, selecting a hole opens details.</li>
                                <li><strong>Match Centre:</strong> Football mode only.</li>
                                <li><strong>Notices Board:</strong> Shows top, middle, and bottom notices.</li>
                                <li><strong>Schedule System:</strong> Can temporarily override notices.</li>
                                <li><strong>Reload Button:</strong> Fetches fresh data from the server.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="font-semibold text-lg mb-2">Preview may differ slightly to actual screen</h3>
                        </section>

                        {/* SCHEDULE STATUS */}
                        <section>
                            <h3 className="font-semibold text-lg mb-2">Schedule Status</h3>

                            {scheduleActive ? (
                                <div className="p-3 rounded bg-green-600/20 border border-green-600 text-green-700 text-sm">
                                    <strong>Schedule Active</strong>
                                    <div className="text-xs opacity-80 mt-1">
                                        From {toUnityIsoStringFromString(activeScheduleEntry?.start)} to {toUnityIsoStringFromString(activeScheduleEntry?.end)}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 rounded bg-red-600/20 border border-red-600 text-red-700 text-sm">
                                    <strong>No Active Schedule</strong>
                                </div>
                            )}

                            <p className="text-sm mt-3 leading-relaxed">
                                When a schedule entry is active, its notices override the normal
                                top, middle, and bottom notices.
                            </p>
                        </section>

                        {/* OVERRIDE SUMMARY */}
                        <section>
                            <h3 className="font-semibold text-lg mb-2">Notice Override Summary</h3>

                            <div className="space-y-3 text-sm">
                                {["Top", "Middle", "Bottom"].map((label, idx) => {
                                    const overridden =
                                        scheduleActive &&
                                        activeScheduleEntry &&
                                        Boolean(
                                            idx === 0
                                                ? activeScheduleEntry.topNotice
                                                : idx === 1
                                                    ? activeScheduleEntry.middleNotice
                                                    : activeScheduleEntry.bottomNotice
                                        )

                                    return (
                                        <div key={idx} className="border rounded p-3">
                                            <strong>{label} Notice</strong>
                                            <div className="mt-1">
                                                {overridden ? (
                                                    <span className="text-green-700">
                                                        Overridden by schedule
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600">
                                                        Using normal notice
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                    </Card>
                </DialogContent>
            </Dialog>
        </>
    )
})
