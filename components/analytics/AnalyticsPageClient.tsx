"use client";

import React, { useState, useTransition, useCallback, useEffect, useMemo, useRef } from "react";
import { Monitor, PanelTopBottomDashed, X, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getScreenAnalytics } from "@/lib/actions/user.actions";
import InteractionsDashboard, {
    type InteractionEntry,
    type ScreenComparisonItem,
} from "@/components/InteractionDashboard";
import CompareScreensDashboard from "@/components/analytics/CompareScreensDashboard";
import { normalizeInteraction } from "@/lib/analytics-utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                       */
/* -------------------------------------------------------------------------- */
interface ScreenAnalyticsData {
    screenName: string;
    interactions: InteractionEntry[];
    total: number;
}

interface Props {
    screenNames: string[];
    loadedScreen: string | null;
    /** Pre-fetched data for the initially loaded screen (may be null) */
    initialData: ScreenAnalyticsData | null;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function AnalyticsPageClient({
    screenNames,
    loadedScreen,
    initialData,
}: Props) {
    /* ---- active single-screen view ---- */
    const defaultScreen = initialData?.screenName ?? loadedScreen ?? screenNames[0] ?? null;
    const [activeScreen, setActiveScreen] = useState<string | null>(defaultScreen);

    /* Cache fetched data so we don't re-fetch on switch */
    const [dataCache, setDataCache] = useState<Record<string, ScreenAnalyticsData>>(() => {
        if (initialData) {
            return { [initialData.screenName]: initialData };
        }
        return {};
    });

    const [isPending, startTransition] = useTransition();

    /* ---- compare mode ---- */
    const [compareMode, setCompareMode] = useState(false);
    const [compareScreens, setCompareScreens] = useState<string[]>([]);
    const [compareData, setCompareData] = useState<ScreenAnalyticsData[]>([]);
    const [isLoadingCompare, setIsLoadingCompare] = useState(false);

    const fetchedRef = useRef<Set<string>>(new Set());

    /* ---- fetch helper ---- */
    const fetchScreen = useCallback(
        async (name: string): Promise<ScreenAnalyticsData | null> => {
            if (dataCache[name]) return dataCache[name];
            const result = await getScreenAnalytics(name);
            if (!result) return null;
            const data: ScreenAnalyticsData = {
                screenName: result.screenName,
                interactions: result.interactions,
                total: result.total,
            };
            setDataCache((prev) => ({ ...prev, [name]: data }));
            return data;
        },
        [dataCache]
    );

    // Track initialData in ref
    useEffect(() => {
        if (initialData?.screenName) {
            fetchedRef.current.add(initialData.screenName);
        }
    }, [initialData]);

    // Initial load for first screen if not pre-fetched
    useEffect(() => {
        if (!initialData && screenNames.length > 0 && !dataCache[screenNames[0]]) {
            const firstScreen = screenNames[0];
            if (!fetchedRef.current.has(firstScreen)) {
                fetchedRef.current.add(firstScreen);
                fetchScreen(firstScreen).then((data) => {
                    if (data) {
                        setDataCache((prev) => ({
                            ...prev,
                            [data.screenName]: data,
                        }));
                    }
                });
            }
        }
    }, [initialData, screenNames, fetchScreen, dataCache]);

    // Background fetch other screens so screen comparison on single screen view has total interactions
    useEffect(() => {
        if (screenNames.length <= 1) return;

        screenNames.forEach(async (name) => {
            if (fetchedRef.current.has(name)) return;
            fetchedRef.current.add(name);
            const result = await getScreenAnalytics(name);
            if (result) {
                setDataCache((prev) => ({
                    ...prev,
                    [result.screenName]: {
                        screenName: result.screenName,
                        interactions: result.interactions,
                        total: result.total,
                    },
                }));
            }
        });
    }, [screenNames]);

    // Compute screen comparison totals (adding all segments together)
    const screenComparison = useMemo<ScreenComparisonItem[]>(() => {
        if (screenNames.length <= 1) return [];

        return screenNames.map((name) => {
            const cached = dataCache[name];
            if (!cached) {
                return {
                    screenName: name,
                    total: null,
                    isLoading: true,
                };
            }

            const total = cached.interactions.reduce((sum, item) => {
                return sum + normalizeInteraction(item).total;
            }, 0);

            return {
                screenName: name,
                total,
                isLoading: false,
            };
        });
    }, [screenNames, dataCache]);

    /* ---- single-screen switcher ---- */
    const handleScreenChange = (name: string) => {
        setActiveScreen(name);
        if (!dataCache[name]) {
            startTransition(async () => {
                await fetchScreen(name);
            });
        }
    };

    /* ---- compare: toggle a screen ---- */
    const toggleCompareScreen = async (name: string) => {
        const alreadySelected = compareScreens.includes(name);
        const newSelection = alreadySelected
            ? compareScreens.filter((s) => s !== name)
            : [...compareScreens, name];

        setCompareScreens(newSelection);

        if (!alreadySelected) {
            setIsLoadingCompare(true);
            const data = await fetchScreen(name);
            setIsLoadingCompare(false);
            if (data) {
                setCompareData((prev) => {
                    const exists = prev.find((d) => d.screenName === name);
                    return exists ? prev : [...prev, data];
                });
            }
        } else {
            setCompareData((prev) => prev.filter((d) => d.screenName !== name));
        }
    };

    /* ---- enter compare mode ---- */
    const handleEnterCompare = async () => {
        setCompareMode(true);
        // Pre-select all available screens (or up to 4)
        const initial = screenNames.slice(0, Math.min(screenNames.length, 4));
        setCompareScreens(initial);

        setIsLoadingCompare(true);
        const results = await Promise.all(initial.map((name) => fetchScreen(name)));
        setIsLoadingCompare(false);
        const validResults = results.filter((r): r is ScreenAnalyticsData => r !== null);
        setCompareData(validResults);
    };

    /* ---- exit compare mode ---- */
    const handleExitCompare = () => {
        setCompareMode(false);
        setCompareScreens([]);
        setCompareData([]);
    };

    const activeData = activeScreen ? (dataCache[activeScreen] ?? null) : null;
    const noScreens = screenNames.length === 0;

    /* -------------------------------------------------------------------------- */
    /*  Render                                                                     */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="p-4 space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="flex items-center gap-3 text-2xl font-bold">
                    <PanelTopBottomDashed />
                    Analytics
                </h1>

                {!noScreens && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {!compareMode ? (
                            <>
                                {/* Screen picker */}
                                <Select
                                    value={activeScreen ?? ""}
                                    onValueChange={handleScreenChange}
                                    disabled={isPending}
                                >
                                    <SelectTrigger className="w-[220px]">
                                        <Monitor className="h-4 w-4 mr-1 shrink-0" />
                                        <SelectValue placeholder="Select a screen…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {screenNames.map((name) => (
                                            <SelectItem key={name} value={name}>
                                                {name}
                                                {name === loadedScreen && (
                                                    <span className="ml-2 text-xs text-muted-foreground">(active)</span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Compare button */}
                                {screenNames.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEnterCompare}
                                        className="flex items-center gap-2"
                                    >
                                        <GitCompareArrows className="h-4 w-4" />
                                        Compare screens
                                    </Button>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Compare mode header */}
                                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <GitCompareArrows className="h-4 w-4" />
                                    Compare screens:
                                </span>

                                <div className="flex flex-wrap gap-1">
                                    {screenNames.map((name) => {
                                        const selected = compareScreens.includes(name);
                                        return (
                                            <Button
                                                key={name}
                                                size="sm"
                                                variant={selected ? "default" : "outline"}
                                                onClick={() => toggleCompareScreen(name)}
                                                disabled={isLoadingCompare}
                                                className="flex items-center gap-1"
                                            >
                                                <Monitor className="h-3 w-3" />
                                                {name}
                                                {selected && <X className="h-3 w-3 ml-0.5" />}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleExitCompare}
                                    className="flex items-center gap-1 text-muted-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    Exit compare
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <Separator />

            {/* Body */}
            {noScreens ? (
                <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground">
                    No screens are connected to your account yet. Add an account in Settings to get started.
                </div>
            ) : compareMode ? (
                /* ---- COMPARE MODE ---- */
                <div className="space-y-6">
                    {compareScreens.length === 0 ? (
                        <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground">
                            Select two or more screens above to compare their analytics.
                        </div>
                    ) : (
                        <>
                            {isLoadingCompare && (
                                <div className="text-sm text-muted-foreground animate-pulse">
                                    Loading analytics data…
                                </div>
                            )}

                            {compareData.length > 0 && (
                                <CompareScreensDashboard data={compareData} />
                            )}
                        </>
                    )}
                </div>
            ) : (
                /* ---- SINGLE SCREEN VIEW ---- */
                <div className="space-y-6">
                    {/* Screen badge */}
                    {activeScreen && (
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-3">
                                <Monitor className="h-3.5 w-3.5" />
                                {activeScreen}
                                {activeScreen === loadedScreen && (
                                    <span className="flex items-center gap-1 ml-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-xs">active</span>
                                    </span>
                                )}
                            </Badge>
                        </div>
                    )}

                    {isPending ? (
                        <div className="p-8 border rounded-2xl bg-card text-center text-muted-foreground animate-pulse">
                            Loading analytics for {activeScreen}…
                        </div>
                    ) : activeData ? (
                        <InteractionsDashboard
                            interactions={activeData.interactions}
                            screenName={activeScreen ?? undefined}
                            screenComparison={screenComparison}
                            onSelectScreen={handleScreenChange}
                        />
                    ) : (
                        <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground">
                            {activeScreen
                                ? `No analytics data available for "${activeScreen}" yet.`
                                : "Select a screen above to view its analytics."}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
