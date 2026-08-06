'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getUserInfo } from '@/lib/actions/user.actions'
import {DiffEntry, findFileSafeName,findFileSafeNames, previewScreenChanges} from '@/lib/actions/file.actions'
import {useDirtyState, usePreviewState} from "@/stores/user-store"
import type { PreviewResult } from "@/components/screen/CopyConfirmDialog"
import {info} from "next/dist/build/output/log";
import {getFontInfo} from "@/data/font";
import {RotateCcw} from "lucide-react";

async function resolvePreviewFile(folderName: string, fileName: string) {
    const safeFileName = await findFileSafeName(folderName, fileName)
    if (safeFileName === fileName || safeFileName[0] === 'd') return null
    return `/api/downloads/${folderName}/${safeFileName}`
}

const ApiUrl = "https://teescreenapp.com/api/schedule";

export default function PreviewScreen() {
    const [userInfo, setUserInfo] = useState<any>(null)
    const [overlayContent, setOverlayContent] = useState<{ type: 'image' | 'url' | 'vid' | 'pdf' | 'full' | 'fbUrl' | 'fbImg' | 'fbPdf'; src: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [previews, setPreviews] = useState<PreviewResult[]>([])
    const [scheduled, setScheduled] = useState<boolean>(false)

    // image states
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
    const [overviewImage, setOverviewImage] = useState<string | null>(null)
    const [logoImage, setLogoImage] = useState<string | null>(null)
    const [homeBG, setHomeBG] = useState<string | null>(null)
    const [awayBG, setAwayBG] = useState<string | null>(null)
    const [lineUpBG, setLineUpBG] = useState<string | null>(null)
    const [hideScoreBG, setHideScoreBG] = useState<string | null>(null)
    const [tabs, setTabs] = useState<any[]>([])
    const [notices, setNotices] = useState<any[]>([])
    const [fanGuidePDF, setFanGuidePDF] = useState<string | null>(null)

    //json states
    // UI and config states
    const [uiColor, setUiColor] = useState<string>('#ffffff')
    const [showTopSection, setShowTopSection] = useState<boolean>(true)
    const [setTabIconsToFill, setSetTabIconsToFill] = useState<boolean>(false)
    const [isFootballClub, setIsFootballClub] = useState<boolean>(false)
    const [isGolfClub, setIsGolfClub] = useState<boolean>(false)
    const [hideHolesOnScreen, setHideHolesOnScreen] = useState<boolean>(false)
    const [footballNews, setFootballNews] = useState<string>("https://www.teescreen.co.uk/")
    const [backupBG, setBackupBG] = useState<string>("/assets/demo/backups/GolfBackground.png")
    const [brightness, setBrightness] = useState<number>(1)
    const [hideMatchCentre, setHideMatchCentre] = useState<boolean>(false)
    const [font, setFont] = useState<string>("arial")
    const [replaceNews, setReplaceNews] = useState<boolean>(false)

    const { version, dirty, externalEditVersion } = useDirtyState()
    const { preview } = usePreviewState();


    // On version updates, call preview changes
    useEffect(() => {
        if (preview)
        {
            console.log("fetching data")

            fetchData()
        }
    }, [preview])

    // On version updates, call preview changes
    useEffect(() => {
        if (version > 0 && !loading && dirty) {
            handlePreview()
        }
        else if ((version === 0 || version === 1) && !dirty && !loading)
        {
            fetchData()
        }
    }, [version, dirty])

    const fetchData = async () => {
        setLoading(true)
        const info = await getUserInfo()
        setUserInfo(info)
        if (!info?.screenJson) {
            console.log("Loading false");

            setLoading(false)
            return
        }
        updateOtherFields(info.screenJson);

        const folderName = info.screenJson.FolderNameOnServer
        await resolveImages(folderName)
        await resolveTabsAndNotices(folderName, info.screenJson)
        await fetchSchedule(info?.loadedScreen);
        setLoading(false)

    }

    const handlePreview = async () => {
        setLoading(true)
        const userinfo = await getUserInfo()
        setUserInfo(userInfo);
        const res = await previewScreenChanges([`${userinfo?.loadedScreen}`])

        if (res.success && res.previews) {
            setPreviews(res.previews);
            await applyFileChanges(res.sourceFolder, res.previews);
            res.previews.forEach(p => applyJsonDiffs(p.diffs || []));
        } else {
            console.error(res.message || "Preview failed")
        }

        updateOtherFields(userinfo.screenJson);
        await fetchSchedule(userinfo?.loadedScreen);
        setLoading(false)
    }

    const fetchSchedule = async (screenName : string) => {
        try {
            const res = await fetch(`${ApiUrl}?filename=${screenName}`);
            if (!res.ok) {
                console.log("no schedule available", await res.text());
                return;
            }

            const data = await res.json();
            const entries = data.entries || [];

            const active = findActiveScheduleEntry(entries);

            if (active) {
                console.log("[schedule] Active entry:", active);
                applyActiveScheduleEntry(active);

            } else {
                if(scheduled)
                {
                    removeActiveScheduleEntry();
                }
                
                setScheduled(false)
                console.log("[schedule] No active schedule entry");
            }

        } catch (err) {
            console.log("Failed to load schedule", err);
        }
    };


    function findActiveScheduleEntry(entries: any[]) {
        const now = new Date();

        return entries.find(e => {
            const start = new Date(e.start);
            const end = new Date(e.end);
            return now >= start && now <= end;
        });
    }

    function applyActiveScheduleEntry(entry: any) {
        if (!entry) return;

        setNotices([
            {
                text: entry.topNotice,
                color: entry.topColour,
                active: true,
                urlActive: false,
                url: null,
                image: null,
            },
            {
                text: entry.middleNotice,
                color: entry.middleColour,
                active: true,
                urlActive: false,
                url: null,
                image: null,
            },
            {
                text: entry.bottomNotice,
                color: entry.bottomColour,
                active: true,
                urlActive: false,
                url: null,
                image: null,
            },
        ]);

        setScheduled(true);
    }
    function removeActiveScheduleEntry() {

        const data = userInfo.screenJson;
        const noticeDefs = [
            {
                text: data.TopNoticeText,
                color: data.TopNoticeBoardColour,
                active: data.TopNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonTop,
                url: data.urlNoticeButtonTop,
            },
            {
                text: data.MiddleNoticeText,
                color: data.MiddleNoticeBoardColour,
                active: data.MiddleNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonMiddle,
                url: data.urlNoticeButtonMiddle,
            },
            {
                text: data.BottomNoticeText,
                color: data.BottomNoticeBoardColour,
                active: data.BottomNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonBottom,
                url: data.urlNoticeButtonBottom,
            },
        ]
        setNotices(noticeDefs)
    }

    const resolveImages = async (folderName: string) => {
        const previewNames = [
            "Background",
            "Overview",
            "Logo",
            "HomeBG",
            "AwayBG",
            "LineUpBG",
            "HideMatchImage",
            "FanGuide"
        ];

        const safeNames = await findFileSafeNames(folderName, previewNames);

        const resolved = safeNames.map((safe, i) => {
            const original = previewNames[i];

            // Same logic as your old resolvePreviewFile()
            if (!safe || safe === original || safe[0] === "d") {
                return null;
            }

            return `/api/downloads/${folderName}/${safe}`;
        });
        // Assign in order
        setBackgroundImage(resolved[0]);
        setOverviewImage(resolved[1]);
        setLogoImage(resolved[2]);
        setHomeBG(resolved[3]);
        setAwayBG(resolved[4]);
        setLineUpBG(resolved[5]);
        setHideScoreBG(resolved[6]);
        setFanGuidePDF(resolved[7]);
        console.log(fanGuidePDF);
    };

    const resolveTabsAndNotices = async (folderName: string, data: any) => {
        // All filenames needed for tabs + notices
        const fileNames = [
            // Tabs
            "CustomTabIcon01.png",
            "CustomTabImage01",
            "CustomTabIcon02.png",
            "CustomTabImage02",
            "CustomTabIcon03.png",
            "CustomTabImage03",
            "CustomTabIcon04.png",
            "CustomTabImage04",

            // Notices
            "NoticeImage01",
            "NoticeImage02",
            "NoticeImage03"
        ];

        // Fetch all safe names in one call
        const safeNames = await findFileSafeNames(folderName, fileNames);

        // Helper to resolve a single safe filename
        const resolveSafe = (safe: string, original: string) => {
            if (!safe || safe === original || safe[0] === "d") {
                return null;
            }
            return `/api/downloads/${folderName}/${safe}`;
        };

        // Map safe names back to their respective items
        let idx = 0;

        const tabDefs = [
            {
                active: data.CustomTab01Active,
                name: data.CustomTab01Name,
                icon: resolveSafe(safeNames[idx++], "CustomTabIcon01.png"),
                overlayImage: resolveSafe(safeNames[idx++], "CustomTabImage01"),
                urlActive: data.CustomTab01UrlActive,
                url: data.CustomTab01Url,
            },
            {
                active: data.CustomTab02Active,
                name: data.CustomTab02Name,
                icon: resolveSafe(safeNames[idx++], "CustomTabIcon02.png"),
                overlayImage: resolveSafe(safeNames[idx++], "CustomTabImage02"),
                urlActive: data.CustomTab02UrlActive,
                url: data.CustomTab02Url,
            },
            {
                active: data.CustomTab03Active,
                name: data.CustomTab03Name,
                icon: resolveSafe(safeNames[idx++], "CustomTabIcon03.png"),
                overlayImage: resolveSafe(safeNames[idx++], "CustomTabImage03"),
                urlActive: data.CustomTab03UrlActive,
                url: data.CustomTab03Url,
            },
            {
                active: data.CustomTab04Active,
                name: data.CustomTab04Name,
                icon: resolveSafe(safeNames[idx++], "CustomTabIcon04.png"),
                overlayImage: resolveSafe(safeNames[idx++], "CustomTabImage04"),
                urlActive: data.CustomTab04UrlActive,
                url: data.CustomTab04Url,
            },
        ].filter(t => t.active);

        setTabs(tabDefs);

        const noticeDefs = [
            {
                text: data.TopNoticeText,
                color: data.TopNoticeBoardColour,
                active: data.TopNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonTop,
                url: data.urlNoticeButtonTop,
                image: resolveSafe(safeNames[idx++], "NoticeImage01"),
            },
            {
                text: data.MiddleNoticeText,
                color: data.MiddleNoticeBoardColour,
                active: data.MiddleNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonMiddle,
                url: data.urlNoticeButtonMiddle,
                image: resolveSafe(safeNames[idx++], "NoticeImage02"),
            },
            {
                text: data.BottomNoticeText,
                color: data.BottomNoticeBoardColour,
                active: data.BottomNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonBottom,
                url: data.urlNoticeButtonBottom,
                image: resolveSafe(safeNames[idx++], "NoticeImage03"),
            },
        ];

        setNotices(noticeDefs);
    };

    function applyJsonDiffs(diffs: DiffEntry[]) {
        diffs.forEach(diff => {
            const { path, newValue } = diff;

            // --- Notices text/flags/urls ---
            if (path.endsWith("TopNoticeText")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, text: newValue } : n));
            }
            if (path.endsWith("MiddleNoticeText")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, text: newValue } : n));
            }
            if (path.endsWith("BottomNoticeText")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, text: newValue } : n));
            }

            // --- Notices colour channels ---
            const noticeColorMatch = path.match(/(Top|Middle|Bottom)NoticeBoardColour\.(r|g|b|a)$/);
            if (noticeColorMatch) {
                const [ , which, channel ] = noticeColorMatch;
                const idx = which === "Top" ? 0 : which === "Middle" ? 1 : 2;
                setNotices(prev => prev.map((n, i) => {
                    if (i !== idx) return n;
                    const prevColor = typeof n.color === "object" ? n.color : { r:0,g:0,b:0,a:255 };
                    const updatedColor = { ...prevColor, [channel]: newValue };
                    return { ...n, color: updatedColor };
                }));
            }

            // --- Notices active/url flags ---
            if (path.endsWith("TopNoticeButtonActive")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, active: newValue } : n));
            }
            if (path.endsWith("MiddleNoticeButtonActive")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, active: newValue } : n));
            }
            if (path.endsWith("BottomNoticeButtonActive")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, active: newValue } : n));
            }

            if (path.endsWith("showUrlNoticeButtonTop")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, urlActive: newValue } : n));
            }
            if (path.endsWith("showUrlNoticeButtonMiddle")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, urlActive: newValue } : n));
            }
            if (path.endsWith("showUrlNoticeButtonBottom")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, urlActive: newValue } : n));
            }

            if (path.endsWith("urlNoticeButtonTop")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, url: newValue } : n));
            }
            if (path.endsWith("urlNoticeButtonMiddle")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, url: newValue } : n));
            }
            if (path.endsWith("urlNoticeButtonBottom")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, url: newValue } : n));
            }

            // --- Tabs ---
            const tabIdxMatch = path.match(/CustomTab(\d+)(Active|Name|UrlActive|Url)$/);
            if (tabIdxMatch) {
                const idx = parseInt(tabIdxMatch[1], 10) - 1;
                const field = tabIdxMatch[2];
                setTabs(prev =>
                    prev.map((t, i) =>
                        i === idx
                            ? {
                                ...t,
                                [field === "Active" ? "active" :
                                    field === "Name" ? "name" :
                                        field === "UrlActive" ? "urlActive" :
                                            "url"]: newValue
                            }
                            : t
                    )
                );
            }
        });
    }

    // Apply preview file changes dynamically
    async function applyFileChanges(folderName: string, previews: PreviewResult[]) {
        previews.forEach((p) => {
            (p.files || []).forEach((file) => {
                const isAdding = file.toLowerCase().startsWith("u")
                const isRemoving = file.toLowerCase().startsWith("d")
                const baseName = file.substring(file.indexOf("-") + 1, file.lastIndexOf("."))
                const fileUrl = `/api/downloads/${folderName}/${file}`

                // Backgrounds
                if (baseName === "Background") setBackgroundImage(isAdding ? fileUrl : "")
                if (baseName === "Overview") setOverviewImage(isAdding ? fileUrl : "")
                if (baseName === "Logo") setLogoImage(isAdding ? fileUrl : "")
                if (baseName === "HomeBG") setHomeBG(isAdding ? fileUrl : "")
                if (baseName === "AwayBG") setAwayBG(isAdding ? fileUrl : "")
                if (baseName === "LineUpBG") setLineUpBG(isAdding ? fileUrl : "")
                if (baseName === "HideMatchImage") setHideScoreBG(isAdding ? fileUrl : "")
                if (baseName === "FanGuide") setFanGuidePDF(isAdding ? fileUrl : "")

                // Tabs (detect index from name)
                const tabMatch = baseName.match(/CustomTab(?:Icon|Image)(\d+)/)
                if (tabMatch) {
                    const idx = parseInt(tabMatch[1], 10) - 1
                    const field = baseName.includes("Icon") ? "icon" : "overlayImage"
                    updateTabImage(idx, field, isAdding ? fileUrl : "")
                }

                // Notices (detect index from name)
                const noticeMatch = baseName.match(/NoticeImage(\d+)/)
                if (noticeMatch) {
                    const idx = parseInt(noticeMatch[1], 10) - 1
                    updateNoticeImage(idx, isAdding ? fileUrl : "")
                }
            })
        })
    }

    function updateTabImage(index: number, field: "icon" | "overlayImage", value: string) {
        setTabs((prev) =>
            prev.map((tab, i) => (i === index ? { ...tab, [field]: value } : tab))
        )
    }

    function updateNoticeImage(index: number, value: string) {
        setNotices((prev) =>
            prev.map((notice, i) => (i === index ? { ...notice, image: value } : notice))
        )
    }

    function updateOtherFields(data: any) {

        if(!data)
        {
            return;
        }

        setUiColor(
            data?.UIColor
                ? `rgba(${data.UIColor.r},${data.UIColor.g},${data.UIColor.b},${data.UIColor.a / 255})`
                : "#ffffff"
        );

        setShowTopSection(data?.showTopSection ?? true);
        setSetTabIconsToFill(data?.setTabIconsToFill ?? false);
        setIsFootballClub(data?.isFootballClub ?? false);
        setIsGolfClub(data?.isGolfClub ?? false);
        setHideHolesOnScreen(data?.hideHolesOnScreen ?? false);
        setHideMatchCentre(data?.hideMatchCentre ?? false);
        setFootballNews(data?.twitterURL ?? "https://www.teescreen.co.uk/");
        setBackupBG(
            `/assets/demo/backups/${
                data.isFootballClub ? "FootballBackground.png" : "GolfBackground.png"
            }`
        );
        setReplaceNews(data?.replaceNews ?? false);

        if (data?.UIColor) {
            const { r, g, b } = data.UIColor;
            setBrightness((r + g + b) / (3 * 255));
        }
        const fontInfo = getFontInfo(data?.font);
        setFont(fontInfo?.className);
    }

    const textColor = brightness < 0.5 ? "text-white" : "text-black";

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="aspect-[9/16] h-full max-h-screen shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
                <Card className="relative w-full h-full border shadow-xl overflow-hidden rounded-none">

                    <div className="absolute inset-0 z-0">
                        <Image src={backgroundImage ?? backupBG} alt="background" fill className="object-cover" />
                    </div>

                    <div className="absolute bottom-0 left-0 z-50 p-1 h-[5%] w-[full]">
                        <Button onClick={fetchData} variant="ghost">
                            <RotateCcw/>
                        </Button>
                    </div>

                    {/* Foreground content pinned full screen */}
                    <div className="absolute inset-0 z-10 flex flex-col h-full">

                        {/* TOP BAR */}
                        <div
                            className={`w-full h-[10%] px-4 grid grid-cols-3 items-center border-b rounded-b-md relative z-30 -mb-[1.3%] ${
                                showTopSection ? '' : 'opacity-0'
                            }`}
                            style={{ backgroundColor: uiColor }}
                        >
                            {/* LEFT — TIME + DATE */}
                            <div className="flex flex-col justify-center h-full items-center left-0">
                                <div className={`${font} ${textColor} text-[4vh] font-semibold leading-none py-1`}>
                                    {new Date().toLocaleTimeString("en-GB", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false
                                    })}
                                </div>

                                <div className={`${font} ${textColor} text-[1vh] font-medium leading-none`}>
                                    {new Date().toLocaleDateString("en-GB", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long"
                                    })}
                                </div>
                            </div>

                            {/* CENTER — LOGO */}
                            <div className="flex justify-center items-center h-[90%]">
                                {logoImage && (
                                    <div className="relative h-full aspect-square">
                                        <Image
                                            src={logoImage}
                                            alt="Club Logo"
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* RIGHT — WEATHER */}
                            <div className="flex justify-end items-center">
                                <div className={` ${font} text-[1.5vh] ${textColor} flex flex-col items-end leading-tight`}>
                                    <span>19°C</span>
                                    <span>6.35 mph</span>
                                    <span>broken clouds</span>
                                </div>
                            </div>

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
                            {overlayContent?.type === 'vid' && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center px-4 -mt-[3%]">
                                    <div className="w-full aspect-square relative">
                                        <video
                                            src={overlayContent.src}
                                            autoPlay={true}
                                            muted={true}
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                        <button
                                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                                            onClick={() => setOverlayContent(null)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                            {overlayContent?.type === 'pdf' && (
                                <div className="absolute top-[10%] bottom-[-10%] left-[10%] right-[10%] z-50 flex items-center justify-center">
                                    <embed
                                        src={overlayContent.src}
                                        type="application/pdf"
                                        className="absolute inset-0 w-full h-full"
                                    />

                                    <button
                                        className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold"
                                        onClick={() => setOverlayContent(null)}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Golf Section */}
                        {isGolfClub && (
                            <div>
                                {/*<div className="absolute top-[9.5%] right-3 z-20">
                                    <Button
                                    className="h-[7vh] w-[7vh] font-semibold bg-white/50 text-black rounded-lg flex items-center justify-center"
                                    onClick={() => setOverlayContent({ type: 'image', src: '/assets/demo/golf/HandicapFake.png' })}
                                    >
                                        <Image
                                            src="/assets/demo/golf/Handicap.png"
                                            alt="Handicap icon"
                                            fill
                                            className="object-contain"
                                        />
                                    </Button>
                                </div>*/}
                                {!hideHolesOnScreen && (
                                    <div className="absolute top-[52.5%] w-full px-4 z-20 flex flex-col gap-3 items-center">

                                        <div className="flex flex-col gap-[1vh]">
                                            <div className="grid grid-cols-9 gap-[2vh]">
                                                {Array.from({ length: 9 }, (_, i) => {
                                                    const hole = i + 1
                                                    return (
                                                        <Button
                                                            key={hole}
                                                            className="h-[3vh] w-[3vh] rounded-full bg-white border border-black text-black text-[1.5vh] font-semibold p-0 flex items-center justify-center"
                                                            onClick={() => setOverlayContent({ type: 'full', src: `/assets/demo/golf/CourseOverlay.png` })}
                                                        >
                                                            {hole}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                            <div className="grid grid-cols-9 gap-[2vh]">
                                                {Array.from({ length: 9 }, (_, i) => {
                                                    const hole = i + 10
                                                    return (
                                                        <Button
                                                            key={hole}
                                                            className="h-[3vh] w-[3vh] rounded-full bg-white border border-black text-black text-[1.5vh] font-semibold p-0 flex items-center justify-center"
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
                                        className="relative p-0 h-[8vh] flex-1 max-w-[25%] rounded-sm flex flex-col items-center justify-center"
                                        style={{ backgroundColor: uiColor }}
                                        onClick={() => {
                                            if (tab.urlActive && tab.url) {
                                                setOverlayContent({ type: "url", src: tab.url });
                                            } else if (tab.overlayImage) {
                                                const lower = tab.overlayImage.toLowerCase();

                                                if (lower.endsWith(".mp4")) {
                                                    setOverlayContent({ type: "vid", src: tab.overlayImage });
                                                }
                                                else if (lower.endsWith(".pdf")){
                                                    setOverlayContent({ type: "pdf", src: tab.overlayImage });
                                                }
                                                    else {
                                                    setOverlayContent({ type: "image", src: tab.overlayImage });
                                                }
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
                                                    className={`relative z-10 ${textColor} ${font} font-semibold text-center max-w-full px-1 text-[clamp(0.6rem,1.5vw,0.9rem)]`}
                                                >
                                                    {tab.name}
                                                </span>
                                            </>
                                        ) : (
                                            <>{tab.icon ? (
                                                <div className="flex-1 w-full h-full flex top-0">
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
                                                    className={`${textColor} ${font} font-semibold text-center break-words whitespace-normal w-full
                                                    ${tab.icon
                                                        ? "flex-[0] bottom-0 text-[1vh] leading-tight"
                                                        : "flex items-center justify-center h-full text-[2vh]"}`}
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
                                            { name: 'Lineups', icon: '/assets/demo/football/LineUp.png', disabled: false, type: 'fbImg', src : lineUpBG ?? "/assets/demo/backups/LineUpBG.png" },
                                            replaceNews ?
                                                { name: 'Fan Guide', icon: '/assets/demo/football/FanGuide.png', disabled: false , type: 'fbPdf', src : fanGuidePDF ?? "https://www.datocms-assets.com/43623/1689861809-the-ifab_football-rules_a-z.pdf"}
                                                : { name: 'News', icon: '/assets/demo/football/News.png', disabled: false , type: 'fbUrl', src : footballNews}
                                        ].map((btn, i) => (
                                            <button
                                                key={i}
                                                disabled={btn.disabled}
                                                className={cn(
                                                    "w-full h-full bg-neutral-700 text-neutral-100 text-[9px] font-semibold flex flex-col items-center justify-center px-1",
                                                    btn.disabled && "opacity-50 cursor-not-allowed"
                                                )}
                                                onClick={() => {
                                                    if (btn.disabled) return;

                                                    const t = btn?.type;
                                                    console.log("btn type: ",t);
                                                    if (t === "fbPdf" || t === "fbUrl" || t === "fbImg") {
                                                        setOverlayContent({ type: t, src: btn?.src ?? "" });
                                                    }
                                                }}
                                            >
                                                <div className="relative w-[60%]  h-[60%] mb-1">
                                                    <Image src={btn.icon} alt={btn.name} fill className="object-contain" />
                                                </div>
                                                <span className="leading-tight text-[1vh] max-w-[90%]">{btn.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {hideMatchCentre && hideScoreBG ? (
                                        <div className="absolute bottom-0 left-0 w-full h-[67%]">
                                            <Image src={hideScoreBG} alt="Home Team" fill className="" />
                                        </div>

                                    ) : (
                                        <div>
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
                                                        <Image src={homeBG} alt="Home Background" fill className="object-cover" />
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
                                                        <Image src={awayBG} alt="Away Background" fill className="object-cover" />
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
                                    )}


                                </div>
                            ) : (
                                // Notices Section
                                <div className="w-full h-full flex flex-col gap-[0.1vh]">
                                    {notices.map((notice, i) => (
                                        <Button
                                            key={i}
                                            className="h-[7vh] p-0 w-full flex-1 rounded-none flex items-center justify-center"
                                            style={{
                                                backgroundColor: `rgba(${notice.color.r},${notice.color.g},${notice.color.b},${notice.color.a / 255})`,
                                            }}
                                            onClick={() => {
                                                if (notice.active) {
                                                    if (notice.urlActive && notice.url) {
                                                        setOverlayContent({ type: "url", src: notice.url });
                                                    } else if (notice.image) {
                                                        setOverlayContent({ type: "image", src: notice.image });
                                                    }
                                                }
                                            }}
                                        >
                                            <span className={`${font} text-[3vh] uppercase font-semibold text-center w-[85%] whitespace-normal break-words leading-[3vh]`}>
                                                {notice.text}
                                            </span>
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

                    {overlayContent?.type === 'fbPdf' && (
                        <div className="absolute top-[10%] bottom-[25%] left-0 right-0 z-50 flex items-center justify-center">
                            <embed
                                src={overlayContent.src}
                                type="application/pdf"
                                className="absolute inset-0 w-full h-full"
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
