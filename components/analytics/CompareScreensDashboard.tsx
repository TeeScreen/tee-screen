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
import { Monitor, TrendingUp, TrendingDown, Home, Calendar } from "lucide-react";
import DateTimeRangePicker from "@/components/DateRangePicker";
import {
    normalizeInteraction,
    getLocalBucket,
    formatLocalBucket,
    type InteractionEntry,
    type TimeGrouping,
} from "@/lib/analytics-utils";

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

function filterEntries(
    interactions: InteractionEntry[],
    range: { from: Date | undefined; to: Date | undefined }
) {
    const fromTime = range.from ? range.from.getTime() : -Infinity;
    let toTime = range.to ? range.to.getTime() : Infinity;

    if (range.to && range.to.getHours() === 0 && range.to.getMinutes() === 0 && range.to.getSeconds() === 0) {
        const end = new Date(range.to);
        end.setHours(23, 59, 59, 999);
        toTime = end.getTime();
    }

    return interactions.map(normalizeInteraction).filter((i) => {
        const t = i.date.getTime();
        return t >= fromTime && t <= toTime;
    });
}

function buildChartData(
    data: ScreenAnalyticsData[],
    grouping: TimeGrouping,
    range: { from: Date | undefined; to: Date | undefined }
) {
    const allScreenNames = data.map((d) => d.screenName);
    const bucketMap = new Map<string, Record<string, number>>();

    data.forEach(({ screenName, interactions }) => {
        const normalized = filterEntries(interactions, range);

        normalized.forEach((i) => {
            const bucket = getLocalBucket(i.date, grouping);

            if (!bucketMap.has(bucket)) {
                const initialRow: Record<string, number> = {};
                allScreenNames.forEach((name) => {
                    initialRow[name] = 0;
                });
                bucketMap.set(bucket, initialRow);
            }

            const row = bucketMap.get(bucket)!;
            row[screenName] = (row[screenName] ?? 0) + i.total;
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
        const normalizedList = filterEntries(interactions, range);
        const total = normalizedList.reduce((sum, item) => sum + item.total, 0);
        const avg = normalizedList.length > 0 ? Math.round(total / normalizedList.length) : 0;

        // Segment breakdown (all unaccounted interactions go to Home Page)
        const segmentTotals: Record<string, number> = {};
        normalizedList.forEach((item) => {
            Object.entries(item.segments).forEach(([k, v]) => {
                segmentTotals[k] = (segmentTotals[k] ?? 0) + v;
            });
        });

        const topSegment =
            Object.entries(segmentTotals).sort((a, b) => b[1] - a[1])[0] ?? null;

        return { screenName, total, avg, topSegment, dataPoints: normalizedList.length };
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
                                        ({stat.topSegment[1].toLocaleString()})
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
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                            <Calendar className="h-8 w-8 opacity-40" />
                            <p>No interaction data recorded for the selected range.</p>
                        </div>
                    ) : (
                        <div className="h-[320px] w-full">
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
                                            hydrated ? formatLocalBucket(v, grouping) : v
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
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        labelFormatter={(v) =>
                                            hydrated ? formatLocalBucket(v, grouping) : v
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
                                            dot={chartData.length <= 1 ? { r: 4, fill: colorForIndex(i) } : false}
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
                        const normalizedList = filterEntries(screen.interactions, range);

                        // Build mini per-segment totals
                        const segTotals: Record<string, number> = {};
                        normalizedList.forEach((int) => {
                            Object.entries(int.segments).forEach(([k, v]) => {
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
                                                    const pct =
                                                        grand > 0
                                                            ? Math.round((count / grand) * 100)
                                                            : 0;
                                                    return (
                                                        <tr
                                                            key={seg}
                                                            className="border-b last:border-0"
                                                        >
                                                            <td className="py-1.5 px-2 flex items-center gap-1.5">
                                                                {seg === "Home Page" && (
                                                                    <Home className="h-3.5 w-3.5 text-blue-500" />
                                                                )}
                                                                <span>{seg}</span>
                                                            </td>
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
