'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserInfo } from '@/lib/actions/user.actions'
import { DiffEntry, findFileSafeName, findFileSafeNames, previewScreenChanges } from '@/lib/actions/file.actions'
import { useDirtyState, usePreviewState } from "@/stores/user-store"
import { getFontInfo } from "@/data/font"
import type { PreviewResult } from "@/components/screen/CopyConfirmDialog"
import type {
    OverlayContent,
    TabItem,
    NoticeItem,
    PreviewImages,
    PreviewUiConfig,
    ScheduleEntry,
    GolfHole, TeeSettings
} from '../types'

const ApiUrl = "https://teescreenapp.com/api/schedule"

export function usePreviewData() {
    const [userInfo, setUserInfo] = useState<any>(null)
    const [overlayContent, setOverlayContent] = useState<OverlayContent | null>(null)
    const [loading, setLoading] = useState(false)
    const [, setPreviews] = useState<PreviewResult[]>([])
    const loadingRef = useRef(false)
    const scheduledRef = useRef(false)
    const activeScheduleEntryRef = useRef<ScheduleEntry | null>(null)
    const userInfoRef = useRef<any>(null)

    // Image states
    const [images, setImages] = useState<PreviewImages>({
        backgroundImage: null,
        overviewImage: null,
        logoImage: null,
        homeBG: null,
        awayBG: null,
        lineUpBG: null,
        hideScoreBG: null,
        fanGuidePDF: null,
        backupBG: "/assets/demo/backups/GolfBackground.png",
    })

    // Config & UI states
    const [uiConfig, setUiConfig] = useState<PreviewUiConfig>({
        uiColor: '#ffffff',
        textColor: 'text-black',
        font: 'arial',
        brightness: 1,
        showTopSection: true,
        setTabIconsToFill: false,
        isFootballClub: false,
        isGolfClub: false,
        hideHolesOnScreen: false,
        hideMatchCentre: false,
        replaceNews: false,
        footballNews: "https://www.teescreen.co.uk/",
    })

    const [holeData, setHoleData] = useState<GolfHole[]>()
    const [teeData, setTeeData] = useState<TeeSettings>({
        TeeColourWhite: {r: 255, g: 255, b: 255, a: 255},
        TeeColourYellow: {r: 255, g: 232, b: 0, a: 255},
        TeeColourRed: {r: 255, g: 0, b: 0, a: 255}
    })


    const [tabs, setTabs] = useState<TabItem[]>([])
    const [notices, setNotices] = useState<NoticeItem[]>([])

    const { version, dirty } = useDirtyState()
    const { preview, screensaver, setScreensaver, draftJson } = usePreviewState()

    const updateOtherFields = useCallback((data: any) => {
        if (!data) return

        let brightnessVal = 1
        if (data?.UIColor) {
            const { r, g, b } = data.UIColor
            brightnessVal = (r + g + b) / (3 * 255)
        }

        const fontInfo = getFontInfo(data?.font)

        setUiConfig({
            uiColor: data?.UIColor
                ? `rgba(${data.UIColor.r},${data.UIColor.g},${data.UIColor.b},${data.UIColor.a / 255})`
                : "#ffffff",
            textColor: brightnessVal < 0.5 ? "text-white" : "text-black",
            font: fontInfo?.className || "arial",
            brightness: brightnessVal,
            showTopSection: data?.showTopSection ?? true,
            setTabIconsToFill: data?.setTabIconsToFill ?? false,
            isFootballClub: data?.isFootballClub ?? false,
            isGolfClub: data?.isGolfClub ?? false,
            hideHolesOnScreen: data?.hideHolesOnScreen ?? false,
            hideMatchCentre: data?.hideMatchCentre ?? false,
            replaceNews: data?.replaceNews ?? false,
            footballNews: data?.twitterURL ?? "https://www.teescreen.co.uk/",
        })

        setTeeData({
            TeeColourWhite: data?.TeeColourWhite,
            TeeColourYellow: data?.TeeColourYellow,
            TeeColourRed: data?.TeeColourRed
        })

        /** -------------------------------
         *  PARSE GOLF HOLE DATA (x/y DTO)
         *  ------------------------------- */
        const selectedCourse = Object.keys(data?.golfCoursesData ?? {})[0] ?? null;
        const rawHoles =
            data?.golfCoursesData?.[selectedCourse]?.holesData ??
            [];

        const parsedHoles: GolfHole[] = rawHoles.map((h: any) => ({
            holeNumber: h.holeNumber,

            holePointLatLong: {
                x: h.holePointLatLong?.x,
                y: h.holePointLatLong?.y,
            },
            whiteTeePointLatLong: {
                x: h.whiteTeePointLatLong?.x,
                y: h.whiteTeePointLatLong?.y,
            },
            redTeePointLatLong: {
                x: h.redTeePointLatLong?.x,
                y: h.redTeePointLatLong?.y,
            },
            yellowTeePointLatLong: {
                x: h.yellowTeePointLatLong?.x,
                y: h.yellowTeePointLatLong?.y,
            },

            yardsToHole: h.yardsToHole,
            redYardsToHole: h.redYardsToHole,
            yellowYardsToHole: h.yellowYardsToHole,
            whiteYardsToHole: h.whiteYardsToHole,

            parNumber: Number(h.parNumber),
            siNumber: Number(h.siNumber),
        }));


        setHoleData(parsedHoles);


        setImages(prev => ({
            ...prev,
            backupBG: `/assets/demo/backups/${data.isFootballClub ? "FootballBackground.png" : "GolfBackground.png"}`
        }))
    }, [])

    const updateTabsAndNoticesFromDraft = useCallback((data: any) => {
        if (!data) return

        setTabs(prevTabs => {
            const rawTabs = [
                {
                    active: data.CustomTab01Active,
                    name: data.CustomTab01Name,
                    urlActive: data.CustomTab01UrlActive,
                    url: data.CustomTab01Url,
                },
                {
                    active: data.CustomTab02Active,
                    name: data.CustomTab02Name,
                    urlActive: data.CustomTab02UrlActive,
                    url: data.CustomTab02Url,
                },
                {
                    active: data.CustomTab03Active,
                    name: data.CustomTab03Name,
                    urlActive: data.CustomTab03UrlActive,
                    url: data.CustomTab03Url,
                },
                {
                    active: data.CustomTab04Active,
                    name: data.CustomTab04Name,
                    urlActive: data.CustomTab04UrlActive,
                    url: data.CustomTab04Url,
                },
            ]

            return rawTabs
                .map((raw, idx) => {
                    const prev = prevTabs[idx] || {}
                    return {
                        ...prev,
                        active: raw.active ?? prev.active,
                        name: raw.name ?? prev.name,
                        urlActive: raw.urlActive ?? prev.urlActive,
                        url: raw.url ?? prev.url,
                    }
                })
                .filter(t => t.active)
        })

        setNotices(prevNotices => {
            const noticeDefs = [
                {
                    active: data?.noticeTopIsActive ?? true,
                    text: data.TopNoticeText,
                    color: data.TopNoticeBoardColour,
                    interactive: data.TopNoticeButtonActive,
                    urlActive: data.showUrlNoticeButtonTop,
                    url: data.urlNoticeButtonTop,
                },
                {
                    active: data?.noticeMiddleIsActive ?? true,
                    text: data.MiddleNoticeText,
                    color: data.MiddleNoticeBoardColour,
                    interactive: data.MiddleNoticeButtonActive,
                    urlActive: data.showUrlNoticeButtonMiddle,
                    url: data.urlNoticeButtonMiddle,
                },
                {
                    active: data?.noticeBottomIsActive ?? true,
                    text: data.BottomNoticeText,
                    color: data.BottomNoticeBoardColour,
                    interactive: data.BottomNoticeButtonActive,
                    urlActive: data.showUrlNoticeButtonBottom,
                    url: data.urlNoticeButtonBottom,
                },
            ]

            return noticeDefs.map((def, idx) => {
                const prev = prevNotices[idx] || {}
                return {
                    ...prev,
                    active: def.active ?? prev.active,
                    text: def.text ?? prev.text,
                    color: def.color ?? prev.color,
                    interactive: def.interactive ?? prev.interactive,
                    urlActive: def.urlActive ?? prev.urlActive,
                    url: def.url ?? prev.url,
                }
            })
        })
    }, [])

    const resolveAllAssets = useCallback(async (folderName: string, data: any) => {
        const allFileNames = [
            "Background",
            "Overview",
            "Logo",
            "HomeBG",
            "AwayBG",
            "LineUpBG",
            "HideMatchImage",
            "FanGuide",
            "CustomTabIcon01.png",
            "CustomTabImage01",
            "CustomTabIcon02.png",
            "CustomTabImage02",
            "CustomTabIcon03.png",
            "CustomTabImage03",
            "CustomTabIcon04.png",
            "CustomTabImage04",
            "NoticeImage01",
            "NoticeImage02",
            "NoticeImage03"
        ]

        const safeNames = await findFileSafeNames(folderName, allFileNames)

        const resolveSafe = (safe: string, original: string) => {
            if (!safe || safe === original || safe[0] === "d") {
                return null
            }
            return `/api/downloads/${folderName}/${safe}`
        }

        setImages(prev => ({
            ...prev,
            backgroundImage: resolveSafe(safeNames[0], allFileNames[0]),
            overviewImage: resolveSafe(safeNames[1], allFileNames[1]),
            logoImage: resolveSafe(safeNames[2], allFileNames[2]),
            homeBG: resolveSafe(safeNames[3], allFileNames[3]),
            awayBG: resolveSafe(safeNames[4], allFileNames[4]),
            lineUpBG: resolveSafe(safeNames[5], allFileNames[5]),
            hideScoreBG: resolveSafe(safeNames[6], allFileNames[6]),
            fanGuidePDF: resolveSafe(safeNames[7], allFileNames[7]),
        }))

        let idx = 8
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
        ].filter(t => t.active)

        setTabs(tabDefs)

        const noticeDefs = [
            {
                active: data?.noticeTopIsActive ?? true,
                text: data.TopNoticeText,
                color: data.TopNoticeBoardColour,
                interactive: data.TopNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonTop,
                url: data.urlNoticeButtonTop,
                image: resolveSafe(safeNames[idx++], "NoticeImage01"),
            },
            {
                active: data?.noticeMiddleIsActive ?? true,
                text: data.MiddleNoticeText,
                color: data.MiddleNoticeBoardColour,
                interactive: data.MiddleNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonMiddle,
                url: data.urlNoticeButtonMiddle,
                image: resolveSafe(safeNames[idx++], "NoticeImage02"),
            },
            {
                active: data?.noticeBottomIsActive ?? true,
                text: data.BottomNoticeText,
                color: data.BottomNoticeBoardColour,
                interactive: data.BottomNoticeButtonActive,
                urlActive: data.showUrlNoticeButtonBottom,
                url: data.urlNoticeButtonBottom,
                image: resolveSafe(safeNames[idx++], "NoticeImage03"),
            },
        ]

        setNotices(noticeDefs)
    }, [])

    const applyJsonDiffs = useCallback((diffs: DiffEntry[]) => {
        diffs.forEach(diff => {
            const { path, newValue } = diff

            if (path.endsWith("TopNoticeText")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, text: newValue } : n))
            }
            if (path.endsWith("MiddleNoticeText")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, text: newValue } : n))
            }
            if (path.endsWith("BottomNoticeText")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, text: newValue } : n))
            }

            const noticeColorMatch = path.match(/(Top|Middle|Bottom)NoticeBoardColour\.(r|g|b|a)$/)
            if (noticeColorMatch) {
                const [ , which, channel ] = noticeColorMatch
                const idx = which === "Top" ? 0 : which === "Middle" ? 1 : 2
                setNotices(prev => prev.map((n, i) => {
                    if (i !== idx) return n
                    const prevColor = typeof n.color === "object" ? n.color : { r: 0, g: 0, b: 0, a: 255 }
                    const updatedColor = { ...prevColor, [channel]: newValue }
                    return { ...n, color: updatedColor }
                }))
            }

            if (path.endsWith("noticeTopIsActive")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, active: newValue } : n))
            }
            if (path.endsWith("noticeMiddleIsActive")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, active: newValue } : n))
            }
            if (path.endsWith("noticeBottomIsActive")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, active: newValue } : n))
            }

            if (path.endsWith("TopNoticeButtonActive")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, interactive: newValue } : n))
            }
            if (path.endsWith("MiddleNoticeButtonActive")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, interactive: newValue } : n))
            }
            if (path.endsWith("BottomNoticeButtonActive")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, interactive: newValue } : n))
            }

            if (path.endsWith("showUrlNoticeButtonTop")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, urlActive: newValue } : n))
            }
            if (path.endsWith("showUrlNoticeButtonMiddle")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, urlActive: newValue } : n))
            }
            if (path.endsWith("showUrlNoticeButtonBottom")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, urlActive: newValue } : n))
            }

            if (path.endsWith("urlNoticeButtonTop")) {
                setNotices(prev => prev.map((n, i) => i === 0 ? { ...n, url: newValue } : n))
            }
            if (path.endsWith("urlNoticeButtonMiddle")) {
                setNotices(prev => prev.map((n, i) => i === 1 ? { ...n, url: newValue } : n))
            }
            if (path.endsWith("urlNoticeButtonBottom")) {
                setNotices(prev => prev.map((n, i) => i === 2 ? { ...n, url: newValue } : n))
            }

            const tabIdxMatch = path.match(/CustomTab(\d+)(Active|Name|UrlActive|Url)$/)
            if (tabIdxMatch) {
                const idx = parseInt(tabIdxMatch[1], 10) - 1
                const field = tabIdxMatch[2]
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
                )
            }
        })
    }, [])

    const updateTabImage = useCallback((index: number, field: "icon" | "overlayImage", value: string) => {
        setTabs((prev) =>
            prev.map((tab, i) => (i === index ? { ...tab, [field]: value } : tab))
        )
    }, [])

    const updateNoticeImage = useCallback((index: number, value: string) => {
        setNotices((prev) =>
            prev.map((notice, i) => (i === index ? { ...notice, image: value } : notice))
        )
    }, [])

    const applyFileChanges = useCallback(async (folderName: string, previewResults: PreviewResult[]) => {
        previewResults.forEach((p) => {
            (p.files || []).forEach((file) => {
                const isAdding = file.toLowerCase().startsWith("u")
                const baseName = file.substring(file.indexOf("-") + 1, file.lastIndexOf("."))
                const fileUrl = `/api/downloads/${folderName}/${file}`

                if (baseName === "Background") setImages(prev => ({ ...prev, backgroundImage: isAdding ? fileUrl : "" }))
                if (baseName === "Overview") setImages(prev => ({ ...prev, overviewImage: isAdding ? fileUrl : "" }))
                if (baseName === "Logo") setImages(prev => ({ ...prev, logoImage: isAdding ? fileUrl : "" }))
                if (baseName === "HomeBG") setImages(prev => ({ ...prev, homeBG: isAdding ? fileUrl : "" }))
                if (baseName === "AwayBG") setImages(prev => ({ ...prev, awayBG: isAdding ? fileUrl : "" }))
                if (baseName === "LineUpBG") setImages(prev => ({ ...prev, lineUpBG: isAdding ? fileUrl : "" }))
                if (baseName === "HideMatchImage") setImages(prev => ({ ...prev, hideScoreBG: isAdding ? fileUrl : "" }))
                if (baseName === "FanGuide") setImages(prev => ({ ...prev, fanGuidePDF: isAdding ? fileUrl : "" }))

                const tabMatch = baseName.match(/CustomTab(?:Icon|Image)(\d+)/)
                if (tabMatch) {
                    const idx = parseInt(tabMatch[1], 10) - 1
                    const field = baseName.includes("Icon") ? "icon" : "overlayImage"
                    updateTabImage(idx, field, isAdding ? fileUrl : "")
                }

                const noticeMatch = baseName.match(/NoticeImage(\d+)/)
                if (noticeMatch) {
                    const idx = parseInt(noticeMatch[1], 10) - 1
                    updateNoticeImage(idx, isAdding ? fileUrl : "")
                }
            })
        })
    }, [updateTabImage, updateNoticeImage])

    const applyActiveScheduleEntry = useCallback((entry: ScheduleEntry, currentData: any) => {
        if (!entry || !currentData) return

        setNotices([
            {
                active: entry.topNotice ? true : currentData?.noticeTopIsActive ?? true,
                text: entry.topNotice ? entry.topNotice : currentData.TopNoticeText,
                color: entry.topNotice ? entry.topColour : currentData.TopNoticeBoardColour,
                interactive: currentData.TopNoticeButtonActive,
                urlActive: currentData.showUrlNoticeButtonTop,
                url: currentData.urlNoticeButtonTop,
            },
            {
                active: entry.middleNotice ? true : currentData?.noticeMiddleIsActive ?? true,
                text: entry.middleNotice ? entry.middleNotice : currentData.MiddleNoticeText,
                color: entry.middleNotice ? entry.middleColour : currentData.MiddleNoticeBoardColour,
                interactive: currentData.MiddleNoticeButtonActive,
                urlActive: currentData.showUrlNoticeButtonMiddle,
                url: currentData.urlNoticeButtonMiddle,
            },
            {
                active: entry.bottomNotice ? true : currentData?.noticeBottomIsActive ?? true,
                text: entry.bottomNotice ? entry.bottomNotice : currentData.BottomNoticeText,
                color: entry.bottomNotice ? entry.bottomColour : currentData.BottomNoticeBoardColour,
                interactive: currentData.BottomNoticeButtonActive,
                urlActive: currentData.showUrlNoticeButtonBottom,
                url: currentData.urlNoticeButtonBottom,
            },
        ])

        scheduledRef.current = true
    }, [])

    const removeActiveScheduleEntry = useCallback((currentData: any) => {
        if (!currentData) return
        const noticeDefs = [
            {
                active: currentData?.noticeTopIsActive ?? true,
                text: currentData.TopNoticeText,
                color: currentData.TopNoticeBoardColour,
                interactive: currentData.TopNoticeButtonActive,
                urlActive: currentData.showUrlNoticeButtonTop,
                url: currentData.urlNoticeButtonTop,
            },
            {
                active: currentData?.noticeMiddleIsActive ?? true,
                text: currentData.MiddleNoticeText,
                color: currentData.MiddleNoticeBoardColour,
                interactive: currentData.MiddleNoticeButtonActive,
                urlActive: currentData.showUrlNoticeButtonMiddle,
                url: currentData.urlNoticeButtonMiddle,
            },
            {
                active: currentData?.noticeBottomIsActive ?? true,
                text: currentData.BottomNoticeText,
                color: currentData.BottomNoticeBoardColour,
                interactive: currentData.BottomNoticeButtonActive,
                urlActive: currentData.showUrlNoticeButtonBottom,
                url: currentData.urlNoticeButtonBottom,
            },
        ]
        setNotices(noticeDefs)
    }, [])

    const fetchSchedule = useCallback(async (screenName: string, currentData: any) => {
        try {
            const res = await fetch(`${ApiUrl}?filename=${screenName}`)
            if (!res.ok) {
                console.log("no schedule available", await res.text())
                return
            }

            const data = await res.json()
            const entries = data.entries || []

            const now = new Date()
            const active = entries.find((e: ScheduleEntry) => {
                const start = new Date(e.start)
                const end = new Date(e.end)
                return now >= start && now <= end
            })

            if (active) {
                console.log("[schedule] Active entry:", active)
                applyActiveScheduleEntry(active, currentData)
                scheduledRef.current = true
                activeScheduleEntryRef.current = active

            } else {
                if (scheduledRef.current) {
                    removeActiveScheduleEntry(currentData)
                }
                scheduledRef.current = false
                activeScheduleEntryRef.current = null
                console.log("[schedule] No active schedule entry")
            }
        } catch (err) {
            console.log("Failed to load schedule", err)
        }
    }, [applyActiveScheduleEntry, removeActiveScheduleEntry])

    const fetchData = useCallback(async () => {
        if (loadingRef.current) return
        loadingRef.current = true
        setLoading(true)
        try {
            const info = await getUserInfo()
            setUserInfo(info)
            userInfoRef.current = info
            if (!info?.screenJson) {
                console.log("Loading false")
                return
            }
            updateOtherFields(info.screenJson)

            const folderName = info.screenJson.FolderNameOnServer
            await resolveAllAssets(folderName, info.screenJson)
            await fetchSchedule(info?.loadedScreen, info.screenJson)
            setScreensaver("")
        } catch (err) {
            console.error("fetchData error:", err)
        } finally {
            loadingRef.current = false
            setLoading(false)
        }
    }, [updateOtherFields, resolveAllAssets, fetchSchedule, setScreensaver])

    const handlePreview = useCallback(async () => {
        if (loadingRef.current) return
        loadingRef.current = true
        try {
            const userinfo = await getUserInfo()
            if (userinfo) {
                setUserInfo(userinfo)
                userInfoRef.current = userinfo
            }
            const res = await previewScreenChanges([`${userinfo?.loadedScreen}`], "current", userinfo)

            if (res.success && res.previews) {
                setPreviews(res.previews)
                await applyFileChanges(res.sourceFolder, res.previews)
                res.previews.forEach(p => applyJsonDiffs(p.diffs || []))
            } else {
                console.error(res.message || "Preview failed")
            }

            if (userinfo?.screenJson) {
                updateOtherFields(userinfo.screenJson)
            }
        } catch (err) {
            console.error("handlePreview error:", err)
        } finally {
            loadingRef.current = false
        }
    }, [applyFileChanges, applyJsonDiffs, updateOtherFields])

    // On draftJson updates, optimistically update UI fields without waiting for server round-trips
    useEffect(() => {
        if (draftJson) {
            updateOtherFields(draftJson)
            updateTabsAndNoticesFromDraft(draftJson)
        }
    }, [draftJson, updateOtherFields, updateTabsAndNoticesFromDraft])

    // On preview toggle updates
    useEffect(() => {
        if (preview) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preview])

    // On version updates, call preview changes
    useEffect(() => {
        if (version > 0 && !loadingRef.current && dirty) {
            handlePreview()
        } else if ((version === 0 || version === 1) && !dirty && !loadingRef.current) {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version, dirty])

    // Screensaver setup
    useEffect(() => {
        if (screensaver === "") return

        let isMounted = true
        const setup = async () => {
            const folder = userInfoRef.current?.screenJson?.FolderNameOnServer ?? userInfo?.screenJson?.FolderNameOnServer
            if (!folder) return
            const safeFileName = await findFileSafeName(folder, screensaver)
            if (!isMounted || safeFileName === screensaver) return

            if (safeFileName.endsWith(".png")) {
                setOverlayContent({ type: 'ssImage', src: `/api/downloads/${folder}/${safeFileName}` })
            } else if (safeFileName.endsWith(".mp4")) {
                setOverlayContent({ type: 'ssVid', src: `/api/downloads/${folder}/${safeFileName}` })
            }
        }
        setup()

        return () => {
            isMounted = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [screensaver])

    const clearScreensaver = useCallback(() => {
        setScreensaver("")
        setOverlayContent(null)
    }, [setScreensaver])

    return {
        userInfo,
        loading,
        images,
        uiConfig,
        tabs,
        notices,
        overlayContent,
        setOverlayContent,
        fetchData,
        clearScreensaver,
        scheduleActive: scheduledRef.current,
        activeScheduleEntry: activeScheduleEntryRef.current,
        holeData,
        teeData,
    }
}
