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
    const [overlayContent, setOverlayContent] = useState<{ type: 'image' | 'url' | 'full' | 'fbUrl' | 'fbImg'; src: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const { version, dirty } = useDirtyState()
    useEffect(() => {
            console.log('version', version);
            fetchData()
    }, [version, dirty])

    const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
    const [overviewImage, setOverviewImage] = useState<string | null>(null)
    const [logoImage, setLogoImage] = useState<string | null>(null)
    const [homeBG, setHomeBG] = useState<string | null>(null)
    const [awayBG, setAwayBG] = useState<string | null>(null)
    const [lineUpBG, setLineUpBG] = useState<string | null>(null)
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
        setHomeBG(await resolvePreviewFile(folderName, 'HomeBG'))
        setAwayBG(await resolvePreviewFile(folderName, 'AwayBG'))
        setLineUpBG(await resolvePreviewFile(folderName, 'LineUpBG'))

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

    const isFootballClub = data.isFootballClub ? data.isFootballClub : false;
    const isGolfClub = data.isGolfClub ? data.isGolfClub : false;
    const hideHolesOnScreen = data.hideHolesOnScreen ? data.hideHolesOnScreen : false;
    const footballNews = data.twitterURL ? data.twitterURL : "https://www.teescreen.co.uk/";

    const backupBG = `/assets/demo/backups/${isFootballClub ? "FootballBackground.png" : "GolfBackground.png"}`;

    let brightness = 1; // default to light
    if (data?.UIColor) {
        const { r, g, b } = data.UIColor;
        brightness = (r + g + b) / (3 * 255);
    }

    const textColor = brightness < 0.5 ? "text-white" : "text-black"
    return (
        <div className="flex items-center justify-center h-screen bg-black">
            <div className="aspect-[9/16] h-full max-h-screen bg-black shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
                <Card className="relative w-full h-full border shadow-xl overflow-hidden rounded-none">

                    <div className="absolute inset-0 z-0">
                        <Image src={backgroundImage ?? backupBG} alt="background" fill className="object-cover" />
                    </div>


                    {/* Foreground content pinned full screen */}
                    <div className="absolute inset-0 z-10 flex flex-col h-full">

                        {/* TOP BAR */}
                        <div
                            className={`w-full h-[10%] px-4 flex items-center justify-between border-b rounded-b-md relative z-30 -mb-[1.3%] ${
                                showTopSection ? '' : 'opacity-0'
                            }`}
                            style={{ backgroundColor: uiColor }}
                        >
                            <div className={`${textColor} text-xl font-semibold`}>10:55</div>
                            {logoImage && (
                                <div className="relative h-full aspect-square">
                                    <Image src={logoImage} alt="Club Logo" fill className="object-contain p-1" />
                                </div>
                            )}
                            <div className={`text-sm text-muted-foreground ${textColor}`}>Mon, 30 Mar</div>
                        </div>

                        {/* OVERVIEW */}
                        <div className="relative w-full aspect-square flex-shrink-0 ">
                            {overviewImage && (
                                <Image src={overviewImage} alt="Overview" fill className="object-contain" />
                            )}

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
                        {/* Golf Section */}
                        {isGolfClub && (
                            <div>
                                <div className="absolute top-[9.5%] right-3 z-20">
                                    <Button
                                    className="h-12 w-12 text-sm font-semibold bg-white/50 text-black rounded-lg flex items-center justify-center"
                                    onClick={() => setOverlayContent({ type: 'image', src: '/assets/demo/golf/HandicapFake.png' })}
                                    >
                                        <Image
                                            src="/assets/demo/golf/Handicap.png"
                                            alt="Handicap icon"
                                            fill
                                            className="object-contain"
                                        />
                                    </Button>
                                </div>
                                {!hideHolesOnScreen && (
                                    <div className="absolute top-[50%] w-full px-4 z-20 flex flex-col gap-3">

                                        <div className="flex flex-col gap-2">
                                            <div className="grid grid-cols-9 gap-2">
                                                {Array.from({ length: 9 }, (_, i) => {
                                                    const hole = i + 1
                                                    return (
                                                        <Button
                                                            key={hole}
                                                            className="h-6 w-6 rounded-full bg-white border border-black text-black text-xs font-semibold p-0 flex items-center justify-center"
                                                            onClick={() => setOverlayContent({ type: 'full', src: `/assets/demo/golf/CourseOverlay.png` })}
                                                        >
                                                            {hole}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                            <div className="grid grid-cols-9 gap-2">
                                                {Array.from({ length: 9 }, (_, i) => {
                                                    const hole = i + 10
                                                    return (
                                                        <Button
                                                            key={hole}
                                                            className="h-6 w-6 rounded-full bg-white border border-black text-black text-xs font-semibold p-0 flex items-center justify-center"
                                                            onClick={() => setOverlayContent({ type: 'full', src: `/assets/demo/golf/CourseOverlay.png`})}
                                                        >
                                                            {hole}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="relative w-full px-2 z-30 -mt-[2%]">
                            <div className="flex justify-center gap-2 w-full">
                                {tabs.map((tab, i) => (
                                    <Button
                                        key={i}
                                        className="relative h-16 flex-1 max-w-[25%] rounded-sm overflow-hidden flex flex-col items-center justify-center"
                                        style={{ backgroundColor: uiColor }}
                                        onClick={() => {
                                            if (tab.urlActive && tab.url) {
                                                setOverlayContent({ type: "url", src: tab.url });
                                            } else if (tab.overlayImage) {
                                                setOverlayContent({ type: "image", src: tab.overlayImage });
                                            }
                                        }}
                                    >
                                        {setTabIconsToFill ? (
                                            <>
                                                {tab.icon && (
                                                    <Image
                                                        src={tab.icon}
                                                        alt={`${tab.name} icon`}
                                                        fill
                                                        className="object-cover opacity-60"
                                                    />
                                                )}
                                                <span
                                                    className={`relative z-10 ${textColor} font-semibold text-center w-full px-1 text-[clamp(0.6rem,1.5vw,0.9rem)]`}
                                                >
              {tab.name}
            </span>
                                            </>
                                        ) : (
                                            <>
                                                {tab.icon ? (
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
                                                ) : null}

                                                {/* Text: vertically centered if no icon */}
                                                <span
                                                    className={`${textColor} font-semibold text-center break-words
                ${tab.icon
                                                        ? "flex-[1] max-h-[15%] text-[clamp(0.4rem,1.2vw,0.6rem)] leading-tight"
                                                        : "flex items-center justify-center h-full w-full text-[clamp(0.8rem,2vw,1.2rem)] whitespace-normal"}`}
                                                >
              {tab.name}
            </span>
                                            </>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Bottom Section — either Football OR Notices */}
                        <div className="h-[25%] w-full flex flex-col mt-auto">
                            {isFootballClub ? (
                                // Football Section
                                <div className="w-full h-full bg-neutral-600 overflow-hidden relative">
                                    {/* TOP ROW — 4 fixed buttons */}
                                    <div className="grid grid-cols-4 h-1/3">
                                        {[
                                            { name: 'League Tables', icon: '/assets/demo/football/LeagueTable.png', disabled: true },
                                            { name: 'Live Scores', icon: '/assets/demo/football/LiveScore.png', disabled: true },
                                            { name: 'Lineups', icon: '/assets/demo/football/LineUp.png', disabled: false, type: 'fbImg', src : lineUpBG ?? "/assets/demo/backups/LineUpBG.jpg" },
                                            { name: 'News', icon: '/assets/demo/football/News.png', disabled: false , type: 'fbUrl', src : footballNews},
                                        ].map((btn, i) => (
                                            <button
                                                key={i}
                                                disabled={btn.disabled}
                                                className={cn(
                                                    "w-full h-full bg-neutral-700 text-neutral-100 text-[9px] font-semibold flex flex-col items-center justify-center px-1",
                                                    btn.disabled && "opacity-50 cursor-not-allowed"
                                                )}
                                                onClick={() => {
                                                    if (!btn.disabled && btn.type == 'fbUrl') {
                                                        setOverlayContent({type: btn.type, src: btn.src})
                                                    }
                                                    else if(!btn.disabled && btn.type == "fbImg"){
                                                        setOverlayContent({type: btn.type, src: btn.src})
                                                    }}}
                                            >
                                                <div className="relative w-5 h-5 mb-1">
                                                    <Image src={btn.icon} alt={btn.name} fill className="object-contain" />
                                                </div>
                                                <span className="leading-tight text-[9px] max-w-[90%]">{btn.name}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Overlay block */}
                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/4 h-[63%] bg-neutral-700 text-neutral-100 flex flex-col items-center justify-center text-xs font-semibold z-20 rounded-b-2xl space-y-1">
                                        <span>Venue Name</span>
                                        <span>010:10</span>
                                    </div>

                                    {/* HOME + AWAY side by side */}
                                    <div className="absolute bottom-0 left-0 w-full h-[67%] grid grid-cols-2">
                                        {/* HOME */}
                                        <div className="relative overflow-hidden">
                                            {homeBG ? (
                                                <Image src={homeBG} alt="Home Background" fill className="object-cover opacity-30" />
                                            ) : logoImage ? (
                                                <div className="absolute inset-0 right flex items-center justify-end">
                                                    <div className="relative w-70 h-70">
                                                        <Image src={logoImage} alt="Home Team Logo" fill className="object-cover opacity-20 bg-black/90" />
                                                    </div>
                                                </div>
                                            ) : null}

                                            {logoImage && (
                                                <div className="absolute left-0 inset-0 flex items-center px-4">
                                                    <div className="relative h-20 w-20">
                                                        <Image src={logoImage} alt="Home Team" fill className="object-contain object-left" />
                                                    </div>
                                                    <span className="text-6xl font-extrabold text-neutral-100 drop-shadow-2xl">2</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* AWAY */}
                                        <div className="relative overflow-hidden">
                                            {awayBG ? (
                                                <Image src={awayBG} alt="Away Background" fill className="object-cover opacity-30" />
                                            ) : logoImage ? (
                                                <div className="absolute inset-0 flex items-center justify-start">
                                                    <div className="relative w-70 h-70">
                                                        <Image src={logoImage} alt="Away Team Logo" fill className="object-cover opacity-20 bg-black/90" />
                                                    </div>
                                                </div>
                                            ) : null}

                                            {logoImage && (
                                                <div className="absolute inset-0 flex items-center justify-end px-4">
                                                    <span className="text-6xl font-extrabold text-neutral-100 drop-shadow-2xl mr-4">1</span>
                                                    <div className="relative h-20 w-20">
                                                        <Image src={logoImage} alt="Away Team" fill className="object-contain object-right" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                // Notices Section
                                <div className="w-full h-full flex flex-col gap-0.5">
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
                            )}
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

                    {overlayContent?.type === 'full' && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center">
                            <Image
                                src={overlayContent.src}
                                alt = "full overlay"
                                fill
                                className="w-full h-full bg-white"
                            />
                            <button
                                className="absolute top-24 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                                onClick={() => setOverlayContent(null)}
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {overlayContent?.type === 'fbImg' && (
                        <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
                            <Image
                                src={overlayContent.src}
                                alt = "full overlay"
                                fill
                                className="w-full h-full bg-white"
                            />
                            <Image
                                src="/assets/demo/football/squad.png"
                                alt = "full overlay"
                                fill
                                className="w-full h-full"
                            />
                            <button
                                className="absolute top-24 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                                onClick={() => setOverlayContent(null)}
                            >
                                ×
                            </button>
                        </div>
                    )}
                    {overlayContent?.type === 'fbUrl' && (
                        <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
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
