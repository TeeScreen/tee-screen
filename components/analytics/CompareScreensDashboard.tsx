"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Monitor, TrendingUp, TrendingDown, Minus } from "lucide-react";
import DateTimeRangePicker from "@/components/DateRangePicker";
import { type InteractionEntry } from "@/components/InteractionDashboard";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
interface ScreenAnalyticsData {
    screenName: string;
    interactions: InteractionEntry[];
}

interface Props {
    data: ScreenAnalyticsData[];
}

type TimeGrouping = "day" | "hour" | "10min";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */
const COLORS = [
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#10b981", // emerald
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f97316", // orange
    "#ec4899", // pink
];

function colorForIndex(i: number) {
    return COLORS[i % COLORS.length];
}

function bucketKey(date: Date, grouping: TimeGrouping): string {
    const iso = date.toISOString();
    if (grouping === "day") return iso.slice(0, 10);
    if (grouping === "hour") {
        return `${iso.slice(0, 10)}T${String(date.getHours()).padStart(2, "0")}:00`;
    }
    const m = Math.floor(date.getMinutes() / 10) * 10;
    return `${iso.slice(0, 10)}T${String(date.getHours()).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function formatBucket(bucket: string, grouping: TimeGrouping) {
    const d = new Date(bucket);
    if (grouping === "day") return d.toLocaleDateString();
    if (grouping === "hour") return `${d.toLocaleDateString()} ${d.getHours()}:00`;
    const m = d.getMinutes();
    const rounded = Math.floor(m / 10) * 10;
    return `${d.toLocaleDateString()} ${d.getHours()}:${String(rounded).padStart(2, "0")}`;
}

function buildChartData(
    data: ScreenAnalyticsData[],
    grouping: TimeGrouping,
    range: { from: Date | undefined; to: Date | undefined }
) {
    // Collect all bucket keys across all screens
    const bucketMap = new Map<string, Record<string, number>>();

    data.forEach(({ screenName, interactions }) => {
        const filtered = interactions.filter((i) => {
            if (!range.from || !range.to) return true;
            const d = new Date(i.loggedTime);
            return d >= range.from! && d <= range.to!;
        });

        filtered.forEach((i) => {
            const bucket = bucketKey(new Date(i.loggedTime), grouping);
            if (!bucketMap.has(bucket)) bucketMap.set(bucket, {});
            const row = bucketMap.get(bucket)!;
            row[screenName] = (row[screenName] ?? 0) + i.numOfInteractions;
        });
    });

    return Array.from(bucketMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([bucket, values]) => ({ bucket, ...values }));
}

function buildSummaryStats(
    data: ScreenAnalyticsData[],
    range: { from: Date | undefined; to: Date | undefined }
) {
    return data.map(({ screenName, interactions }) => {
        const filtered = interactions.filter((i) => {
            if (!range.from || !range.to) return true;
            const d = new Date(i.loggedTime);
            return d >= range.from! && d <= range.to!;
        });

        const total = filtered.reduce((sum, i) => sum + i.numOfInteractions, 0);
        const avg =
            filtered.length > 0 ? Math.round(total / filtered.length) : 0;

        // Segment breakdown
        const segmentTotals: Record<string, number> = {};
        filtered.forEach((i) => {
            const segs = i.segmentInteractions ?? {};
            Object.entries(segs).forEach(([k, v]) => {
                segmentTotals[k] = (segmentTotals[k] ?? 0) + v;
            });
        });

        const topSegment =
            Object.entries(segmentTotals).sort((a, b) => b[1] - a[1])[0] ?? null;

        return { screenName, total, avg, topSegment, dataPoints: filtered.length };
    });
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function CompareScreensDashboard({ data }: Props) {
    const [hydrated, setHydrated] = useState(false);
    useEffect(() => setHydrated(true), []);

    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });
    const [grouping, setGrouping] = useState<TimeGrouping>("day");
    const [stacked, setStacked] = useState(false);

    const chartData = useMemo(
        () => buildChartData(data, grouping, range),
        [data, grouping, range]
    );

    const summaryStats = useMemo(
        () => buildSummaryStats(data, range),
        [data, range]
    );

    const screenNames = data.map((d) => d.screenName);

    /* ---- Best / worst by total interactions ---- */
    const sorted = [...summaryStats].sort((a, b) => b.total - a.total);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <DateTimeRangePicker value={range} onChange={setRange} />
                <Select
                    value={grouping}
                    onValueChange={(v) => setGrouping(v as TimeGrouping)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Group by…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="hour">Hour</SelectItem>
                        <SelectItem value="10min">10 Minutes</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant={stacked ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStacked((s) => !s)}
                >
                    {stacked ? "Stacked" : "Overlap"}
                </Button>
            </div>

            {/* Summary stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {summaryStats.map((stat, i) => {
                    const color = colorForIndex(i);
                    const isBest = stat.screenName === best?.screenName && data.length > 1;
                    const isWorst =
                        stat.screenName === worst?.screenName &&
                        data.length > 1 &&
                        worst?.screenName !== best?.screenName;

                    return (
                        <Card
                            key={stat.screenName}
                            className="relative overflow-hidden"
                            style={{ borderTop: `3px solid ${color}` }}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                    <Monitor className="h-4 w-4" style={{ color }} />
                                    <span className="truncate">{stat.screenName}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-2xl font-bold">
                                    {stat.total.toLocaleString()}
                                </div>
                                <p className="text-xs text-muted-foreground">total interactions</p>
                                <div className="text-sm text-muted-foreground">
                                    Avg per entry:{" "}
                                    <span className="font-medium text-foreground">{stat.avg}</span>
                                </div>
                                {stat.topSegment && (
                                    <div className="text-xs text-muted-foreground">
                                        Top segment:{" "}
                                        <span className="font-medium text-foreground">
                                            {stat.topSegment[0]}
                                        </span>{" "}
                                        ({stat.topSegment[1]})
                                    </div>
                                )}
                                {isBest && (
                                    <Badge
                                        className="flex items-center gap-1 w-fit text-xs"
                                        style={{ backgroundColor: color, color: "#fff" }}
                                    >
                                        <TrendingUp className="h-3 w-3" /> Highest
                                    </Badge>
                                )}
                                {isWorst && (
                                    <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
                                        <TrendingDown className="h-3 w-3" /> Lowest
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Overlay chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Interaction Trend — All Screens</CardTitle>
                    <CardDescription>
                        Total interactions per {grouping === "10min" ? "10 minutes" : grouping} for each selected screen
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                            No data to display for the selected range.
                        </div>
                    ) : (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        {screenNames.map((name, i) => (
                                            <linearGradient
                                                key={name}
                                                id={`compare-fill-${i}`}
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor={colorForIndex(i)}
                                                    stopOpacity={0.5}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor={colorForIndex(i)}
                                                    stopOpacity={0.05}
                                                />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="bucket"
                                        tickFormatter={(v) =>
                                            hydrated ? formatBucket(v, grouping) : v
                                        }
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        minTickGap={40}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip
                                        labelFormatter={(v) =>
                                            hydrated ? formatBucket(v, grouping) : v
                                        }
                                        contentStyle={{
                                            borderRadius: "8px",
                                            border: "1px solid var(--border)",
                                            background: "var(--background)",
                                        }}
                                    />
                                    <Legend />
                                    {screenNames.map((name, i) => (
                                        <Area
                                            key={name}
                                            dataKey={name}
                                            type="monotone"
                                            fill={`url(#compare-fill-${i})`}
                                            stroke={colorForIndex(i)}
                                            strokeWidth={2}
                                            stackId={stacked ? "stack" : undefined}
                                            dot={false}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Individual panels */}
            <div className="space-y-2">
                <h2 className="text-base font-semibold">Per-screen breakdown</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {data.map((screen, i) => {
                        const color = colorForIndex(i);
                        const filtered = screen.interactions.filter((int) => {
                            if (!range.from || !range.to) return true;
                            const d = new Date(int.loggedTime);
                            return d >= range.from! && d <= range.to!;
                        });

                        // Build mini per-segment totals
                        const segTotals: Record<string, number> = {};
                        filtered.forEach((int) => {
                            const segs = int.segmentInteractions ?? {};
                            Object.entries(segs).forEach(([k, v]) => {
                                segTotals[k] = (segTotals[k] ?? 0) + v;
                            });
                        });
                        const segEntries = Object.entries(segTotals).sort(
                            (a, b) => b[1] - a[1]
                        );

                        return (
                            <Card
                                key={screen.screenName}
                                style={{ borderTop: `3px solid ${color}` }}
                            >
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Monitor className="h-4 w-4" style={{ color }} />
                                        {screen.screenName}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {segEntries.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            No segment data available.
                                        </p>
                                    ) : (
                                        <table className="w-full border-collapse text-sm">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-1.5 px-2 font-medium">
                                                        Segment
                                                    </th>
                                                    <th className="text-right py-1.5 px-2 font-medium">
                                                        Interactions
                                                    </th>
                                                    <th className="text-right py-1.5 px-2 font-medium">
                                                        Share
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {segEntries.map(([seg, count]) => {
                                                    const grand = segEntries.reduce(
                                                        (s, [, c]) => s + c,
                                                        0
                                                    );
                                                    const pct = grand > 0
                                                        ? Math.round((count / grand) * 100)
                                                        : 0;
                                                    return (
                                                        <tr
                                                            key={seg}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="py-1.5 px-2">{seg}</td>
                                                            <td className="py-1.5 px-2 text-right font-medium">
                                                                {count.toLocaleString()}
                                                            </td>
                                                            <td className="py-1.5 px-2 text-right text-muted-foreground">
                                                                {pct}%
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
