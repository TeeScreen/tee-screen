"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    Line,
} from "recharts";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
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

import DateTimeRangePicker from "@/components/DateRangePicker";

export interface InteractionEntry {
    numOfInteractions: number;
    loggedTime: string;
    segmentInteractions: Record<string, number> | null;
}

interface Props {
    interactions: InteractionEntry[];
}

type TimeGrouping = "day" | "hour" | "10min";

/* ---------------------------------------------
   PURE CLIENT FORMATTERS (NO HOOKS)
---------------------------------------------- */
function formatBucketClient(bucket: string, grouping: TimeGrouping) {
    const d = new Date(bucket);

    if (grouping === "day") {
        return d.toLocaleDateString();
    }

    if (grouping === "hour") {
        return `${d.toLocaleDateString()} ${d.getHours()}:00`;
    }

    const m = d.getMinutes();
    const rounded = Math.floor(m / 10) * 10;
    return `${d.toLocaleDateString()} ${d.getHours()}:${String(rounded).padStart(2, "0")}`;
}

function formatTimestampClient(dateString: string) {
    return new Date(dateString).toLocaleString();
}

/* ---------------------------------------------
   DETERMINISTIC UNIQUE COLOR GENERATOR
---------------------------------------------- */
function colorFromString(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 65%, 55%)`;
}

export default function InteractionsDashboard({ interactions }: Props) {
    const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    });

    const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>("day");
    const [page, setPage] = useState(1);
    const pageSize = 5;

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
       SORT INTERACTIONS
    ---------------------------------------------- */
    const sorted = useMemo(() => {
        return [...interactions].sort(
            (a, b) =>
                new Date(b.loggedTime).getTime() -
                new Date(a.loggedTime).getTime()
        );
    }, [interactions]);

    /* ---------------------------------------------
       FILTER BY DATE RANGE
    ---------------------------------------------- */
    const filtered = useMemo(() => {
        if (!range.from || !range.to) return sorted;

        return sorted.filter((i) => {
            const d = new Date(i.loggedTime);
            return d >= range.from! && d <= range.to!;
        });
    }, [sorted, range]);

    /* ---------------------------------------------
       SSR-SAFE BUCKET KEYS (ISO STRINGS)
    ---------------------------------------------- */
    const bucketFor = (date: Date) => {
        const iso = date.toISOString();

        if (timeGrouping === "day") {
            return iso.slice(0, 10);
        }

        if (timeGrouping === "hour") {
            return `${iso.slice(0, 10)}T${String(date.getHours()).padStart(2, "0")}:00`;
        }

        if (timeGrouping === "10min") {
            const m = Math.floor(date.getMinutes() / 10) * 10;
            return `${iso.slice(0, 10)}T${String(date.getHours()).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        }
    };

    /* ---------------------------------------------
       GROUP BY SEGMENT
    ---------------------------------------------- */
    const segmentGroups = useMemo(() => {
        const groups: Record<
            string,
            { total: number; entries: { loggedTime: string; count: number }[] }
        > = {};

        filtered.forEach((i) => {
            const segments = i.segmentInteractions ?? {};
            const hasSegments = Object.keys(segments).length > 0;

            if (hasSegments) {
                for (const [segment, count] of Object.entries(segments)) {
                    if (!groups[segment]) groups[segment] = { total: 0, entries: [] };
                    groups[segment].total += count;
                    groups[segment].entries.push({
                        loggedTime: i.loggedTime,
                        count,
                    });
                }
            }
        });

        return groups;
    }, [filtered]);

    /* ---------------------------------------------
       INITIALIZE VISIBILITY + COLLAPSE STATE
    ---------------------------------------------- */
    useEffect(() => {
        const initialVisible: Record<string, boolean> = {};
        const initialCollapsed: Record<string, boolean> = {};
        Object.keys(segmentGroups).forEach((s) => {
            initialVisible[s] = true;
            initialCollapsed[s] = false;
        });
        setVisibleSegments(initialVisible);
        setCollapsed(initialCollapsed);
    }, [segmentGroups]);

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
            label: "Total",
            color: "var(--chart-total)",
        };

        return config;
    }, [segmentGroups]);

    /* ---------------------------------------------
       BUILD CHART DATA (TOTAL FIXED)
    ---------------------------------------------- */
    const chartData = useMemo(() => {
        const map = new Map<string, Record<string, number>>();

        filtered.forEach((i) => {
            const d = new Date(i.loggedTime);
            const bucket = bucketFor(d)!;

            if (!map.has(bucket)) map.set(bucket, {});

            const row = map.get(bucket)!;

            const segments = i.segmentInteractions ?? {};
            const segmentSum = Object.values(segments).reduce((a, b) => a + b, 0);

            const unassigned = i.numOfInteractions - segmentSum;

            for (const [segment, count] of Object.entries(segments)) {
                row[segment] = (row[segment] ?? 0) + count;
            }

            row["__unassigned"] = (row["__unassigned"] ?? 0) + Math.max(unassigned, 0);
        });

        return Array.from(map.entries()).map(([bucket, values]) => {
            const { __unassigned = 0, ...segments } = values;

            const total =
                Object.values(segments).reduce((a, b) => a + b, 0) + __unassigned;

            return { bucket, total, ...segments };
        });
    }, [filtered, timeGrouping]);

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

    /* ---------------------------------------------
       CSV EXPORT
    ---------------------------------------------- */
    const handleExportCsv = () => {
        const header = ["Segment", "LoggedTime", "Count"];
        const rows: string[][] = [];

        groupedEntries.forEach(([segment, data]) => {
            data.entries.forEach((e) => {
                rows.push([segment, new Date(e.loggedTime).toISOString(), String(e.count)]);
            });
        });

        const csv =
            [header, ...rows]
                .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
                .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "interactions.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ---------------------------------------------
       RENDER
    ---------------------------------------------- */
    return (
        <div className="mt-6 space-y-8">
            {/* FILTERS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <DateTimeRangePicker value={range} onChange={setRange} />

                    <Select
                        value={timeGrouping}
                        onValueChange={(v) => setTimeGrouping(v as TimeGrouping)}
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

                    <Button
                        variant={showOnlyTotal ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowOnlyTotal((v) => !v)}
                    >
                        {showOnlyTotal ? "Show All Segments" : "Show Only Total"}
                    </Button>
                </div>

                <Button variant="outline" onClick={handleExportCsv}>
                    Export CSV
                </Button>
            </div>

            {/* SEGMENT TOGGLES */}
            {!showOnlyTotal && (
                <div className="flex flex-wrap items-center gap-2">
                    {Object.keys(segmentGroups).map((segment) => (
                        <Button
                            key={segment}
                            variant={visibleSegments[segment] ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                                setVisibleSegments((prev) => ({
                                    ...prev,
                                    [segment]: !prev[segment],
                                }))
                            }
                        >
                            {segment}
                        </Button>
                    ))}
                </div>
            )}

            {/* MINI LEGEND FOR TOTAL-ONLY MODE */}
            {showOnlyTotal && (
                <div className="text-sm text-muted-foreground pl-1">
                    Showing only <span className="font-semibold">Total Interactions</span>
                </div>
            )}

            {/* CHART */}
            <Card>
                <CardHeader>
                    <CardTitle>Interaction Trend</CardTitle>
                </CardHeader>

                <CardContent>
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[300px] w-full"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                {Object.keys(chartConfig).map((segment) => (
                                    <linearGradient
                                        key={segment}
                                        id={`fill-${segment}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor={chartConfig[segment].color}
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor={chartConfig[segment].color}
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                ))}
                            </defs>

                            <CartesianGrid vertical={false} />

                            <XAxis
                                dataKey="bucket"
                                tickFormatter={(bucket) =>
                                    hydrated
                                        ? formatBucketClient(bucket, timeGrouping)
                                        : bucket
                                }
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                            />

                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        indicator="dot"
                                        labelFormatter={(bucket) =>
                                            hydrated
                                                ? formatBucketClient(bucket, timeGrouping)
                                                : bucket
                                        }
                                    />
                                }
                            />

                            {/* TOTAL LINE */}
                            <Line
                                type="monotone"
                                dataKey="total"
                                stroke={chartConfig["total"].color}
                                strokeWidth={2}
                                dot={false}
                            />

                            {/* SEGMENT AREAS */}
                            {!showOnlyTotal &&
                                Object.keys(chartConfig)
                                    .filter((segment) => segment !== "total")
                                    .filter((segment) => visibleSegments[segment])
                                    .map((segment) => (
                                        <Area
                                            key={segment}
                                            dataKey={segment}
                                            type="natural"
                                            fill={`url(#fill-${segment})`}
                                            stroke={chartConfig[segment].color}
                                            strokeWidth={2}
                                            stackId={stacked ? "stack" : undefined}
                                        />
                                    ))}

                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* TABLE */}
            <div className="space-y-4">
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

                {currentPageEntries.map(([segment, data]) => (
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
                            <CardTitle>
                                {segment} — {data.total} interactions
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
                                        <tr key={i} className="border-b">
                                            <td className="p-2">
                                                {hydrated
                                                    ? formatTimestampClient(e.loggedTime)
                                                    : ""}
                                            </td>
                                            <td className="p-2">{e.count}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        )}
                    </Card>
                ))}

                {/* PAGINATION */}
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
            </div>
        </div>
    );
}