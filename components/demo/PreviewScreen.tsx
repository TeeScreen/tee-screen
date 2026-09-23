'use client'

import React, { useCallback } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {InfoIcon, RotateCcw} from 'lucide-react'
import {
    usePreviewData,
    PreviewTopBar,
    PreviewOverview,
    PreviewGolfCourse,
    PreviewTabs,
    PreviewOverlayModal,
    PreviewNoticesBoard,
    PreviewMatchCentre,
    OverlayContent, GolfHole,
} from './preview'
import {PreviewInfo} from "@/components/demo/preview/components/PreviewInfo";

export default function PreviewScreen() {
    const {
        loading,
        images,
        uiConfig,
        tabs,
        notices,
        overlayContent,
        setOverlayContent,
        fetchData,
        clearScreensaver,
        scheduleActive,
        activeScheduleEntry,
        holeData,
        teeData,
    } = usePreviewData()


    const handleCloseOverlay = useCallback(() => {
        setOverlayContent(null)
    }, [setOverlayContent])

    const handleOpenOverlay = useCallback((overlay: OverlayContent) => {
        setOverlayContent(overlay)
    }, [setOverlayContent])

    const handleSelectGolfHole = useCallback((hole : number) => {
        if(!holeData)
        {
            return;
        }

        setOverlayContent({ type: 'golfHole', src: "", hole: holeData[hole-1], tees: teeData })
    }, [setOverlayContent, holeData])


    return (
        <div className="flex items-center justify-center h-screen">
            <div className="aspect-[9/16] h-full max-h-screen shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
                <Card className="relative w-full h-full border shadow-xl overflow-hidden rounded-none">
                    {/* Background */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src={images.backgroundImage ?? images.backupBG}
                            alt="background"
                            fill
                            priority
                            sizes="(max-height: 1080px) 56vh, 100vh"
                            className="object-cover"
                        />
                    </div>

                    {/* Reload Button */}
                    <div className="absolute bottom-0 left-0 z-100 p-1 h-[5%]">
                        <Button onClick={fetchData} variant="outline">
                            <RotateCcw />
                        </Button>
                    </div>

                    <PreviewInfo
                        scheduleActive={scheduleActive}
                        activeScheduleEntry={activeScheduleEntry}
                        notices={notices}
                    />


                    {/* Foreground content pinned full screen */}
                    <div className="absolute inset-0 z-10 flex flex-col h-full">
                        {/* TOP BAR */}
                        <PreviewTopBar
                            showTopSection={uiConfig.showTopSection}
                            uiColor={uiConfig.uiColor}
                            textColor={uiConfig.textColor}
                            font={uiConfig.font}
                            logoImage={images.logoImage}
                        />

                        {/* OVERVIEW */}
                        <PreviewOverview
                            overviewImage={images.overviewImage}
                            overlayContent={overlayContent}
                            onCloseOverlay={handleCloseOverlay}
                        />

                        {/* Golf Section */}
                        <PreviewGolfCourse
                            isGolfClub={uiConfig.isGolfClub}
                            hideHolesOnScreen={uiConfig.hideHolesOnScreen}
                            onSelectHole={handleSelectGolfHole}
                        />

                        {/* Tabs */}
                        <PreviewTabs
                            tabs={tabs}
                            uiColor={uiConfig.uiColor}
                            textColor={uiConfig.textColor}
                            font={uiConfig.font}
                            setTabIconsToFill={uiConfig.setTabIconsToFill}
                            onOpenOverlay={handleOpenOverlay}
                        />

                        {/* Bottom Section — either Football OR Notices */}
                        <div className="h-[25%] w-full flex flex-col mt-auto">
                            {uiConfig.isFootballClub ? (
                                <PreviewMatchCentre
                                    replaceNews={uiConfig.replaceNews}
                                    footballNews={uiConfig.footballNews}
                                    lineUpBG={images.lineUpBG}
                                    fanGuidePDF={images.fanGuidePDF}
                                    hideMatchCentre={uiConfig.hideMatchCentre}
                                    hideScoreBG={images.hideScoreBG}
                                    homeBG={images.homeBG}
                                    awayBG={images.awayBG}
                                    logoImage={images.logoImage}
                                    onOpenOverlay={handleOpenOverlay}
                                />
                            ) : (
                                <PreviewNoticesBoard
                                    notices={notices}
                                    font={uiConfig.font}
                                    onOpenOverlay={handleOpenOverlay}
                                />
                            )}
                        </div>
                    </div>

                    {/* Fullscreen / Partial Overlays & Screensaver */}
                    <PreviewOverlayModal
                        overlayContent={overlayContent}
                        onClose={handleCloseOverlay}
                        onClearScreensaver={clearScreensaver}
                    />

                    {/* Loading spinner overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
