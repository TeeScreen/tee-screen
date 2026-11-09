"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    type ChartConfig,
} from "@/components/ui/chart";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import DateTimeRangePicker from "@/components/DateRangePicker";
import {
    normalizeInteraction,
    getLocalBucket,
    formatLocalBucket,
    type InteractionEntry,
    type TimeGrouping,
} from "@/lib/analytics-utils";
import {
    Monitor,
    TrendingUp,
    TrendingDown,
    Home,
    Layers,
    BarChart3,
    ArrowRight,
    Loader2,
    Calendar,
} from "lucide-react";

export type { InteractionEntry };

export interface ScreenComparisonItem {
    screenName: string;
    total: number | null;
    isLoading?: boolean;
}

interface Props {
    interactions: InteractionEntry[];
    screenName?: string;
    screenComparison?: ScreenComparisonItem[];
    onSelectScreen?: (screenName: string) => void;
}

function formatTimestampClient(dateString: string) {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

const SEGMENT_PALETTE = [
    "#2563eb", // blue (Home Page default)
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f97316", // orange
    "#14b8a6", // teal
    "#6366f1", // indigo
    "#84cc16", // lime
    "#d946ef", // fuchsia
    "#e11d48", // rose
];

function colorFromString(str: string) {
    if (str === "Home Page") {
        return "#2563eb"; // distinct crisp blue for Home Page
    }
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const nonBlue = SEGMENT_PALETTE.slice(1);
    const idx = Math.abs(hash) % nonBlue.length;
    return nonBlue[idx];
}

export default function InteractionsDashboard({
    interactions,
    screenName,
    screenComparison,
    onSelectScreen,
}: Props) {
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("day");
    const [page, setPage] = useState(1);
    const [totalLogPage, setTotalLogPage] = useState(1);
    const pageSize = 5;
    const totalLogPageSize = 10;

    const [stacked, setStacked] = useState(false);
    const [showOnlyTotal, setShowOnlyTotal] = useState(false);

    const [visibleSegments, setVisibleSegments] = useState<Record<string, boolean>>({});
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    /* ---------------------------------------------
       HYDRATION FLAG
    ---------------------------------------------- */
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    /* ---------------------------------------------
       NORMALIZE & SORT INTERACTIONS
    ---------------------------------------------- */
    const normalizedList = useMemo(() => {
        return interactions.map((i) => normalizeInteraction(i));
    }, [interactions]);

    const sorted = useMemo(() => {
        return [...normalizedList].sort(
            (a, b) => b.date.getTime() - a.date.getTime()
        );
    }, [normalizedList]);

    /* ---------------------------------------------
       FILTER BY DATE RANGE (WITH END-OF-DAY SAFETY)
    ---------------------------------------------- */
    const filtered = useMemo(() => {
        if (!range.from && !range.to) return sorted;

        const fromTime = range.from ? range.from.getTime() : -Infinity;
        let toTime = range.to ? range.to.getTime() : Infinity;

        if (range.to && range.to.getHours() === 0 && range.to.getMinutes() === 0 && range.to.getSeconds() === 0) {
            const end = new Date(range.to);
            end.setHours(23, 59, 59, 999);
            toTime = end.getTime();
        }

        return sorted.filter((i) => {
            const t = i.date.getTime();
            return t >= fromTime && t <= toTime;
        });
    }, [sorted, range]);

    /* ---------------------------------------------
       GROUP BY SEGMENT (WITH HOME PAGE NORMALIZED)
    ---------------------------------------------- */
    const segmentGroups = useMemo(() => {
        const groups: Record<
            string,
            { total: number; entries: { loggedTime: string; count: number }[] }
        > = {};

        filtered.forEach((i) => {
            for (const [segment, count] of Object.entries(i.segments)) {
                if (!groups[segment]) groups[segment] = { total: 0, entries: [] };
                groups[segment].total += count;
                groups[segment].entries.push({
                    loggedTime: i.loggedTime,
                    count,
                });
            }
        });

        return groups;
    }, [filtered]);

    /* ---------------------------------------------
       CALCULATE SUMMARY STATS
    ---------------------------------------------- */
    const summaryStats = useMemo(() => {
        const total = filtered.reduce((sum, item) => sum + item.total, 0);
        const homeTotal = segmentGroups["Home Page"]?.total ?? 0;
        const avg = filtered.length > 0 ? Math.round(total / filtered.length) : 0;

        const sortedSegments = Object.entries(segmentGroups).sort(
            (a, b) => b[1].total - a[1].total
        );
        const topSegment = sortedSegments[0] ?? null;

        return {
            total,
            homeTotal,
            avg,
            topSegment,
            dataPoints: filtered.length,
        };
    }, [filtered, segmentGroups]);

    /* ---------------------------------------------
       CHART CONFIG
    ---------------------------------------------- */
    const chartConfig: ChartConfig = useMemo(() => {
        const config: ChartConfig = {};

        Object.keys(segmentGroups).forEach((segment) => {
            config[segment] = {
                label: segment,
                color: colorFromString(segment),
            };
        });

        config["total"] = {
            label: "Total Interactions",
            color: "#2563eb",
        };

        return config;
    }, [segmentGroups]);

    /* ---------------------------------------------
       BUILD CHART DATA (WITH LOCAL BUCKETS & ZERO PRE-FILL)
    ---------------------------------------------- */
    const chartData = useMemo(() => {
        const allSegments = Object.keys(segmentGroups);
        const map = new Map<string, Record<string, number>>();

        filtered.forEach((i) => {
            const bucket = getLocalBucket(i.date, timeGrouping);

            if (!map.has(bucket)) {
                const initialRow: Record<string, number> = {};
                for (const seg of allSegments) {
                    initialRow[seg] = 0;
                }
                map.set(bucket, initialRow);
            }

            const row = map.get(bucket)!;

            for (const [segment, count] of Object.entries(i.segments)) {
                row[segment] = (row[segment] ?? 0) + count;
            }
        });

        return Array.from(map.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([bucket, segments]) => {
                const total = Object.values(segments).reduce((a, b) => a + b, 0);
                return { bucket, total, ...segments };
            });
    }, [filtered, timeGrouping, segmentGroups]);

    /* ---------------------------------------------
       TABLE PAGINATION
    ---------------------------------------------- */
    const groupedEntries = useMemo(
        () => Object.entries(segmentGroups).sort((a, b) => b[1].total - a[1].total),
        [segmentGroups]
    );

    const totalPages = Math.max(1, Math.ceil(groupedEntries.length / pageSize));
    const currentPageEntries = groupedEntries.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const totalLogPages = Math.max(1, Math.ceil(filtered.length / totalLogPageSize));
    const currentTotalLogEntries = filtered.slice(
        (totalLogPage - 1) * totalLogPageSize,
        totalLogPage * totalLogPageSize
    );

    /* ---------------------------------------------
       CSV EXPORT
    ---------------------------------------------- */
    const handleExportCsv = () => {
        const header = ["Screen", "Timestamp", "Segment", "Interactions", "TotalEntry"];
        const rows: string[][] = [];

        filtered.forEach((item) => {
            Object.entries(item.segments).forEach(([seg, count]) => {
                rows.push([
                    screenName || "Screen",
                    item.loggedTime,
                    seg,
                    String(count),
                    String(item.total),
                ]);
            });
        });

        const csv = [header, ...rows]
            .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `interactions-${screenName || "screen"}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ---------------------------------------------
       SCREEN COMPARISON CALCULATIONS
    ---------------------------------------------- */
    const validComparisons = useMemo(() => {
        if (!screenComparison || screenComparison.length <= 1) return [];
        return screenComparison;
    }, [screenComparison]);

    const maxComparisonTotal = useMemo(() => {
        if (validComparisons.length === 0) return 0;
        return Math.max(...validComparisons.map((c) => c.total ?? 0), 1);
    }, [validComparisons]);

    const sortedComparisons = useMemo(() => {
        return [...validComparisons].sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
    }, [validComparisons]);

    const bestScreenName = sortedComparisons[0]?.screenName;
    const worstScreenName =
        sortedComparisons.length > 2
            ? sortedComparisons[sortedComparisons.length - 1]?.screenName
            : undefined;

    /* ---------------------------------------------
       RENDER
    ---------------------------------------------- */
    return (
        <div className="space-y-6">
            {/* SUMMARY STAT CARDS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Interactions */}
                <Card className="relative overflow-hidden border-t-4 border-t-primary shadow-xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>Total Interactions</span>
                            <BarChart3 className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-extrabold tracking-tight">
                            {summaryStats.total.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            All segments combined {range.from || range.to ? "(filtered)" : ""}
                        </p>
                    </CardContent>
                </Card>

                {/* Home Page Interactions */}
                <Card className="relative overflow-hidden border-t-4 border-t-blue-500 shadow-xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>Home Page</span>
                            <Home className="h-4 w-4 text-blue-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-extrabold tracking-tight">
                            {summaryStats.homeTotal.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summaryStats.total > 0
                                ? `${Math.round((summaryStats.homeTotal / summaryStats.total) * 100)}% of total interactions`
                                : "No interactions"}
                        </p>
                    </CardContent>
                </Card>

                {/* Top Segment */}
                <Card className="relative overflow-hidden border-t-4 border-t-emerald-500 shadow-xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>Top Segment</span>
                            <Layers className="h-4 w-4 text-emerald-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-xl font-bold truncate">
                            {summaryStats.topSegment ? summaryStats.topSegment[0] : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {summaryStats.topSegment
                                ? `${summaryStats.topSegment[1].total.toLocaleString()} interactions`
                                : "No segments"}
                        </p>
                    </CardContent>
                </Card>

                {/* Average / Activity */}
                <Card className="relative overflow-hidden border-t-4 border-t-amber-500 shadow-xs">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                            <span>Average per Entry</span>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-3xl font-extrabold tracking-tight">
                            {summaryStats.avg.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across {summaryStats.dataPoints} logged periods
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* SCREEN COMPARISON (TOTAL INTERACTIONS) DISPLAYED RIGHT ON SINGLE SCREEN VIEW */}
            {validComparisons.length > 1 && (
                <Card className="shadow-xs bg-muted/15 border-dashed">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-primary" />
                                    Screen Comparison — Total Interactions
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Compare total interactions across all connected screens. Click a screen to switch views.
                                </CardDescription>
                            </div>
                            <span className="text-xs text-muted-foreground self-start sm:self-auto font-medium">
                                {validComparisons.length} screens
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedComparisons.map((item) => {
                                const isCurrent = item.screenName === screenName;
                                const isBest = item.screenName === bestScreenName;
                                const isWorst =
                                    item.screenName === worstScreenName &&
                                    item.screenName !== bestScreenName;
                                const pct =
                                    item.total != null && maxComparisonTotal > 0
                                        ? Math.round((item.total / maxComparisonTotal) * 100)
                                        : 0;

                                return (
                                    <div
                                        key={item.screenName}
                                        onClick={() =>
                                            !isCurrent && onSelectScreen && onSelectScreen(item.screenName)
                                        }
                                        className={`group relative p-3.5 rounded-xl border transition-all text-left ${
                                            isCurrent
                                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                                : "bg-card hover:border-primary/50 hover:bg-muted/40 cursor-pointer"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="font-semibold text-sm truncate flex items-center gap-1.5">
                                                <Monitor className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                                                <span className="truncate">{item.screenName}</span>
                                            </span>

                                            <div className="flex items-center gap-1 shrink-0">
                                                {isCurrent && (
                                                    <Badge
                                                        variant="default"
                                                        className="text-[10px] px-1.5 py-0 h-4 bg-primary text-primary-foreground"
                                                    >
                                                        Current
                                                    </Badge>
                                                )}
                                                {isBest && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                    >
                                                        <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> High
                                                    </Badge>
                                                )}
                                                {isWorst && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground"
                                                    >
                                                        <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> Low
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-baseline justify-between mb-1.5">
                                            <span className="text-xl font-bold">
                                                {item.isLoading ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                                                        <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                                                    </span>
                                                ) : (
                                                    (item.total ?? 0).toLocaleString()
                                                )}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                interactions
                                            </span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    isCurrent ? "bg-primary" : "bg-primary/50 group-hover:bg-primary"
                                                }`}
                                                style={{ width: `${Math.max(pct, 3)}%` }}
                                            />
                                        </div>

                                        {!isCurrent && onSelectScreen && (
                                            <div className="mt-2 text-[11px] text-muted-foreground group-hover:text-primary flex items-center gap-1 justify-end font-medium transition-colors">
                                                Switch to screen <ArrowRight className="h-3 w-3" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* CONTROLS & FILTERS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <DateTimeRangePicker value={range} onChange={setRange} />

                    <Select
                        value={timeGrouping}
                        onValueChange={(v) => setTimeGrouping(v as TimeGrouping)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Group by…" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day</SelectItem>
                            <SelectItem value="hour">Hour</SelectItem>
                            <SelectItem value="10min">10 Minutes</SelectItem>
                        </SelectContent>
                    </Select>

                    {!showOnlyTotal && (
                        <Button
                            variant={stacked ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStacked((s) => !s)}
                        >
                            {stacked ? "Stacked" : "Overlap"}
                        </Button>
                    )}

                    <Button
                        variant={showOnlyTotal ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowOnlyTotal((v) => !v)}
                        className="font-medium"
                    >
                        {showOnlyTotal ? "Show All Segments" : "Show Only Total"}
                    </Button>
                </div>

                <Button variant="outline" size="sm" onClick={handleExportCsv}>
                    Export CSV
                </Button>
            </div>

            {/* SEGMENT TOGGLES */}
            {!showOnlyTotal && Object.keys(segmentGroups).length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground mr-1 uppercase tracking-wider">
                        Segments:
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            const allActive = Object.fromEntries(
                                Object.keys(segmentGroups).map((s) => [s, true])
                            );
                            setVisibleSegments(allActive);
                        }}
                    >
                        Select All
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            const allInactive = Object.fromEntries(
                                Object.keys(segmentGroups).map((s) => [s, false])
                            );
                            setVisibleSegments(allInactive);
                        }}
                    >
                        Deselect All
                    </Button>
                    {Object.keys(segmentGroups).map((segment) => {
                        const isVisible = visibleSegments[segment] !== false;
                        const color = chartConfig[segment]?.color || "#2563eb";
                        return (
                            <Button
                                key={segment}
                                variant={isVisible ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                style={
                                    isVisible
                                        ? { backgroundColor: color, color: "#ffffff", borderColor: color }
                                        : { borderColor: color, color: "inherit" }
                                }
                                onClick={() =>
                                    setVisibleSegments((prev) => ({
                                        ...prev,
                                        [segment]: prev[segment] === false ? true : false,
                                    }))
                                }
                            >
                                {segment === "Home Page" && <Home className="h-3 w-3 mr-1" />}
                                {segment}
                                <span className="ml-1.5 opacity-80 font-mono text-[11px]">
                                    ({segmentGroups[segment]?.total.toLocaleString()})
                                </span>
                            </Button>
                        );
                    })}
                </div>
            )}

            {/* MINI LEGEND FOR TOTAL-ONLY MODE */}
            {showOnlyTotal && (
                <div className="text-sm text-muted-foreground pl-1 flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span>
                        Showing <strong className="text-foreground">Total Interactions</strong> (all segments combined)
                    </span>
                </div>
            )}

            {/* CHART */}
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {showOnlyTotal
                                    ? "Total Interaction Trend"
                                    : "Segment & Total Interaction Trend"}
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                {showOnlyTotal
                                    ? "All segments added together over time"
                                    : "Breakdown by segment including Home Page and unaccounted interactions"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {chartData.length === 0 ? (
                        <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground gap-2">
                            <Calendar className="h-8 w-8 opacity-40" />
                            <p className="text-sm font-medium">No interaction data recorded for the selected range.</p>
                            <p className="text-xs">Try selecting &quot;All time&quot; or switching screens above.</p>
                        </div>
                    ) : (
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[320px] w-full"
                        >
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="fill-total" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.08} />
                                    </linearGradient>

                                    {Object.keys(chartConfig).map((segment) => {
                                        const safeId = segment.replace(/[^a-zA-Z0-9_-]/g, "_");
                                        const color = chartConfig[segment]?.color || "#2563eb";
                                        return (
                                            <linearGradient
                                                key={segment}
                                                id={`fill-${safeId}`}
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor={color}
                                                    stopOpacity={stacked ? 0.75 : 0.35}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor={color}
                                                    stopOpacity={stacked ? 0.15 : 0.05}
                                                />
                                            </linearGradient>
                                        );
                                    })}
                                </defs>

                                <CartesianGrid vertical={false} strokeDasharray="3 3" />

                                <XAxis
                                    dataKey="bucket"
                                    tickFormatter={(bucket) =>
                                        hydrated ? formatLocalBucket(bucket, timeGrouping) : bucket
                                    }
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                />

                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={36}
                                    allowDecimals={false}
                                />

                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            indicator="dot"
                                            labelFormatter={(bucket) =>
                                                hydrated ? formatLocalBucket(bucket, timeGrouping) : bucket
                                            }
                                        />
                                    }
                                />

                                {/* WHEN SHOW ONLY TOTAL IS ACTIVE: DISPLAY COMBINED TOTAL AREA */}
                                {showOnlyTotal
                                    ? [
                                          <Area
                                              key="total-area"
                                              dataKey="total"
                                              name="Total Interactions"
                                              type="monotone"
                                              fill="url(#fill-total)"
                                              stroke="#2563eb"
                                              strokeWidth={2.5}
                                              activeDot={{ r: 6 }}
                                              dot={chartData.length <= 1 ? { r: 5, fill: "#2563eb" } : false}
                                          />,
                                      ]
                                    : Object.keys(chartConfig)
                                          .filter((segment) => segment !== "total")
                                          .filter((segment) => visibleSegments[segment] !== false)
                                          .map((segment) => {
                                              const safeId = segment.replace(/[^a-zA-Z0-9_-]/g, "_");
                                              const color = chartConfig[segment]?.color || "#2563eb";
                                              return (
                                                  <Area
                                                      key={segment}
                                                      dataKey={segment}
                                                      name={segment}
                                                      type="monotone"
                                                      fill={`url(#fill-${safeId})`}
                                                      stroke={color}
                                                      strokeWidth={2}
                                                      stackId={stacked ? "stack" : undefined}
                                                      activeDot={{ r: 5 }}
                                                      dot={
                                                          chartData.length <= 1
                                                              ? { r: 4, fill: color }
                                                              : false
                                                      }
                                                  />
                                              );
                                          })}

                                <ChartLegend content={<ChartLegendContent />} />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* TABLE SECTION */}
            {showOnlyTotal ? (
                /* TOTAL INTERACTIONS LOG TABLE */
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>
                                Total Interactions Log — {summaryStats.total.toLocaleString()} total
                            </span>
                            <span className="text-xs font-normal text-muted-foreground">
                                {filtered.length} entries
                            </span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Individual timestamp entries with all segments added together
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filtered.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                No entries to display.
                            </p>
                        ) : (
                            <>
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2.5 font-medium">Timestamp</th>
                                            <th className="text-right p-2.5 font-medium">Total Count</th>
                                            <th className="text-left p-2.5 font-medium pl-6">Breakdown</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentTotalLogEntries.map((e, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="p-2.5 font-mono text-xs">
                                                    {hydrated ? formatTimestampClient(e.loggedTime) : ""}
                                                </td>
                                                <td className="p-2.5 text-right font-bold text-foreground">
                                                    {e.total.toLocaleString()}
                                                </td>
                                                <td className="p-2.5 pl-6 text-xs text-muted-foreground">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Object.entries(e.segments).map(([seg, cnt]) => (
                                                            <span
                                                                key={seg}
                                                                className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[11px]"
                                                            >
                                                                <span className="font-medium text-foreground">{seg}:</span> {cnt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination for Total Log */}
                                {totalLogPages > 1 && (
                                    <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t">
                                        <span className="text-xs text-muted-foreground">
                                            Page {totalLogPage} of {totalLogPages}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTotalLogPage((p) => Math.max(1, p - 1))}
                                                disabled={totalLogPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setTotalLogPage((p) => Math.min(totalLogPages, p + 1))}
                                                disabled={totalLogPage === totalLogPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* PER-SEGMENT CARDS TABLE */
                <div className="space-y-4">
                    {currentPageEntries.length > 0 && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setCollapsed(
                                        Object.fromEntries(
                                            Object.keys(segmentGroups).map((s) => [s, true])
                                        )
                                    )
                                }
                            >
                                Collapse All
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setCollapsed(
                                        Object.fromEntries(
                                            Object.keys(segmentGroups).map((s) => [s, false])
                                        )
                                    )
                                }
                            >
                                Expand All
                            </Button>
                        </div>
                    )}

                    {currentPageEntries.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center text-sm text-muted-foreground">
                                No segment interactions recorded.
                            </CardContent>
                        </Card>
                    ) : (
                        currentPageEntries.map(([segment, data]) => (
                            <Card key={segment}>
                                <CardHeader
                                    className="cursor-pointer"
                                    onClick={() =>
                                        setCollapsed((prev) => ({
                                            ...prev,
                                            [segment]: !prev[segment],
                                        }))
                                    }
                                >
                                    <CardTitle className="flex items-center justify-between text-base">
                                        <span className="flex items-center gap-2">
                                            {segment === "Home Page" && (
                                                <Home className="h-4 w-4 text-blue-500" />
                                            )}
                                            {segment} — {data.total.toLocaleString()} interactions
                                        </span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            {summaryStats.total > 0
                                                ? `${Math.round((data.total / summaryStats.total) * 100)}% of total`
                                                : ""}
                                        </span>
                                    </CardTitle>
                                </CardHeader>

                                {!collapsed[segment] && (
                                    <CardContent>
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-2">Timestamp</th>
                                                    <th className="text-left p-2">Count</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {data.entries.map((e, i) => (
                                                    <tr key={i} className="border-b last:border-0">
                                                        <td className="p-2 font-mono text-xs">
                                                            {hydrated
                                                                ? formatTimestampClient(e.loggedTime)
                                                                : ""}
                                                        </td>
                                                        <td className="p-2 font-medium">{e.count}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
