'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getUserInfo } from '@/lib/actions/user.actions'
import { findFileSafeName } from '@/lib/actions/file.actions'
import path from 'path'
import {useDirtyState} from "@/stores/user-store";

async function resolvePreviewFile(folderName: string, fileName: string) {
    let safeFileName = await findFileSafeName(folderName, fileName)
    if (safeFileName === fileName) return null
    return `/api/downloads/${folderName}/${safeFileName}`
}

export default function PreviewScreen() {
    const [userInfo, setUserInfo] = useState<any>(null)
    const [overlayContent, setOverlayContent] = useState<{ type: 'image' | 'url'; src: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const { version, dirty } = useDirtyState()
    useEffect(() => {
            console.log('version', version);
            fetchData()
    }, [version, dirty])

    const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
    const [overviewImage, setOverviewImage] = useState<string | null>(null)
    const [logoImage, setLogoImage] = useState<string | null>(null)
    const [tabs, setTabs] = useState<any[]>([])
    const [notices, setNotices] = useState<any[]>([])

    const fetchData = async () => {
        setLoading(true)
        const info = await getUserInfo()
        setUserInfo(info)
        if (!info?.screenJson)
        {
            setLoading(false)
            return
        }

        const folderName = info.screenJson.FolderNameOnServer

        setBackgroundImage(await resolvePreviewFile(folderName, 'Background'))
        setOverviewImage(await resolvePreviewFile(folderName, 'Overview'))
        setLogoImage(await resolvePreviewFile(folderName, 'Logo'))

        const tabDefs = [
            {
                active: info.screenJson.CustomTab01Active,
                name: info.screenJson.CustomTab01Name,
                icon: await resolvePreviewFile(folderName, 'CustomTabIcon01.png'),
                overlayImage: await resolvePreviewFile(folderName, 'CustomTabImage01'),
                urlActive: info.screenJson.CustomTab01UrlActive,
                url: info.screenJson.CustomTab01Url,
            },
            {
                active: info.screenJson.CustomTab02Active,
                name: info.screenJson.CustomTab02Name,
                icon: await resolvePreviewFile(folderName, 'CustomTabIcon02.png'),
                overlayImage: await resolvePreviewFile(folderName, 'CustomTabImage02'),
                urlActive: info.screenJson.CustomTab02UrlActive,
                url: info.screenJson.CustomTab02Url,
            },
            {
                active: info.screenJson.CustomTab03Active,
                name: info.screenJson.CustomTab03Name,
                icon: await resolvePreviewFile(folderName, 'CustomTabIcon03.png'),
                overlayImage: await resolvePreviewFile(folderName, 'CustomTabImage03'),
                urlActive: info.screenJson.CustomTab03UrlActive,
                url: info.screenJson.CustomTab03Url,
            },
            {
                active: info.screenJson.CustomTab04Active,
                name: info.screenJson.CustomTab04Name,
                icon: await resolvePreviewFile(folderName, 'CustomTabIcon04.png'),
                overlayImage: await resolvePreviewFile(folderName, 'CustomTabImage04'),
                urlActive: info.screenJson.CustomTab04UrlActive,
                url: info.screenJson.CustomTab04Url,
            },
        ].filter(t => t.active)

        setTabs(tabDefs)

        const noticeDefs = [
            {
                text: info.screenJson.TopNoticeText,
                color: info.screenJson.TopNoticeBoardColour,
                active: info.screenJson.TopNoticeButtonActive,
                urlActive: info.screenJson.showUrlNoticeButtonTop,
                url: info.screenJson.urlNoticeButtonTop,
                image: await resolvePreviewFile(folderName, 'NoticeImage01'),
            },
            {
                text: info.screenJson.MiddleNoticeText,
                color: info.screenJson.MiddleNoticeBoardColour,
                active: info.screenJson.MiddleNoticeButtonActive,
                urlActive: info.screenJson.showUrlNoticeButtonMiddle,
                url: info.screenJson.urlNoticeButtonMiddle,
                image: await resolvePreviewFile(folderName, 'NoticeImage02'),
            },
            {
                text: info.screenJson.BottomNoticeText,
                color: info.screenJson.BottomNoticeBoardColour,
                active: info.screenJson.BottomNoticeButtonActive,
                urlActive: info.screenJson.showUrlNoticeButtonBottom,
                url: info.screenJson.urlNoticeButtonBottom,
                image: await resolvePreviewFile(folderName, 'NoticeImage03'),
            },
        ]
        setNotices(noticeDefs)
        setLoading(false)
    }


    useEffect(() => {
        fetchData()
    }, [])

    if (!userInfo || !userInfo.screenJson) return <div>Loading preview…</div>

    const data = userInfo.screenJson
    const uiColor = data.UIColor
        ? `rgba(${data.UIColor.r},${data.UIColor.g},${data.UIColor.b},${data.UIColor.a / 255})`
        : '#ffffff'

    const showTopSection = data.showTopSection ? data.showTopSection : true;
    const setTabIconsToFill = data.setTabIconsToFill ? data.setTabIconsToFill : false;
    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="aspect-[9/16] h-full max-h-screen bg-black shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
                <Card className="relative w-full h-full border shadow-xl overflow-hidden rounded-none">

                    {/* Background lowest layer */}
                    {backgroundImage && (
                        <div className="absolute inset-0 z-0">
                            <Image src={backgroundImage} alt="background" fill className="object-cover" />
                        </div>
                    )}

                    {/* Foreground content pinned full screen */}
                    <div className="absolute inset-0 z-10 flex flex-col h-full">

                        {/* TOP BAR ~10% with conditional visibility */}
                        <div
                            className={`w-full h-[10%] px-4 flex items-center justify-between border-b rounded-b-md relative z-30 -mb-[1.3%] ${
                                showTopSection ? '' : 'opacity-0'
                            }`}
                            style={{ backgroundColor: uiColor }}
                        >
                            <div className="text-black text-xl font-semibold">10:55</div>
                            {logoImage && (
                                <div className="relative h-full aspect-square bg-white">
                                    <Image src={logoImage} alt="Club Logo" fill className="object-contain" />
                                </div>
                            )}
                            <div className="text-sm text-muted-foreground">Mon, 30 Mar</div>
                        </div>

                        {/* OVERVIEW square directly under top bar */}
                        <div className="relative w-full aspect-square flex-shrink-0 z-10">
                            {overviewImage && (
                                <Image src={overviewImage} alt="Overview" fill className="object-contain" />
                            )}

                            {/* Overlay images sit directly over overview */}
                            {overlayContent?.type === 'image' && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 -mt-[3%]">
                                    <div className="w-full aspect-square relative">
                                        <Image src={overlayContent.src} alt="Overlay" fill className="object-contain" />
                                        <button
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                                            onClick={() => setOverlayContent(null)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs overlap the bottom of the overview by ~25% */}
                        <div className="relative w-full px-1 z-30 -mt-[4%]">
                            <div className="grid grid-cols-4 gap-1 w-full">
                                {tabs.map((tab, i) => (
                                    <Button
                                        key={i}
                                        className="relative h-16 w-full rounded-lg overflow-hidden flex flex-col items-center justify-center"
                                        style={{ backgroundColor: uiColor }}
                                        onClick={() => {
                                            if (tab.urlActive && tab.url) {
                                                setOverlayContent({ type: 'url', src: tab.url })
                                            } else if (tab.overlayImage) {
                                                setOverlayContent({ type: 'image', src: tab.overlayImage })
                                            }
                                        }}
                                    >
                                        {setTabIconsToFill ? (
                                            <>
                                                {/* Icon fills background */}
                                                {tab.icon && (
                                                    <Image
                                                        src={tab.icon}
                                                        alt={`${tab.name} icon`}
                                                        fill
                                                        className="object-cover opacity-60"
                                                    />
                                                )}
                                                <span className="relative z-10 text-black font-semibold text-center w-full px-1 text-[clamp(0.6rem,1.5vw,0.9rem)]">
                                                    {tab.name}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                {/* Icon stacked above text */}
                                                {tab.icon && (
                                                    <div className="flex-[5] max-h-[85%] flex items-center justify-center w-full">
                                                        <div className="relative w-full h-full">
                                                            <Image
                                                                src={tab.icon}
                                                                alt={`${tab.name} icon`}
                                                                fill
                                                                className="object-contain"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Text auto‑scales to fit width, max 15% height */}
                                                <span className="flex-[1] max-h-[15%] text-black font-semibold text-center break-words leading-tight text-[clamp(0.4rem,1.2vw,0.6rem)]">
                                                    {tab.name}
                                                </span>


                                            </>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Notices ~25% flush at bottom */}
                        <div className="w-full h-[25%] flex flex-col mt-auto gap-0.5">
                            {notices.map((notice, i) => (
                                <Button
                                    key={i}
                                    className="flex-1 text-xl font-semibold rounded-none"
                                    style={{
                                        backgroundColor: `rgba(${notice.color.r},${notice.color.g},${notice.color.b},${notice.color.a / 255})`,
                                    }}
                                    onClick={() => {
                                        if (notice.active) {
                                            if (notice.urlActive && notice.url) {
                                                setOverlayContent({ type: 'url', src: notice.url })
                                            } else if (notice.image) {
                                                setOverlayContent({ type: 'image', src: notice.image })
                                            }
                                        }
                                    }}
                                >
                                    {notice.text}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Overlay for full‑screen URL */}
                    {overlayContent?.type === 'url' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <iframe
                                src={overlayContent.src}
                                className="w-full h-full bg-white"
                                sandbox="allow-scripts allow-same-origin allow-forms"
                            />
                            <button
                                className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                                onClick={() => setOverlayContent(null)}
                            >
                                ×
                            </button>
                        </div>
                    )}

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
