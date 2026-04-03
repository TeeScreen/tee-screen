"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis } from "recharts";

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
import DateTimeRangePicker from "@/components/DateRangePicker";

export interface CheckIn {
    name: string;
    teeOffTime: string; // ISO string
}

interface Props {
    checkIns: CheckIn[];
}

const chartConfig = {
    checkins: {
        label: "Check-Ins",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig;

// Helpers
function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}
function endOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}

export default function CheckInDashboard({ checkIns }: Props) {
    const [range, setRange] = useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: undefined,
        to: undefined,
    });

    const [page, setPage] = useState(1);
    const pageSize = 5;

    // Sort newest first
    const sorted = useMemo(() => {
        return [...checkIns].sort(
            (a, b) =>
                new Date(b.teeOffTime).getTime() -
                new Date(a.teeOffTime).getTime()
        );
    }, [checkIns]);

    // Filter by date+time range
    const filtered = useMemo(() => {
        if (!range.from || !range.to) return sorted;

        return sorted.filter((c) => {
            const d = new Date(c.teeOffTime);
            return d >= range.from! && d <= range.to!;
        });
    }, [sorted, range]);

    // Group by date
    const grouped = useMemo(() => {
        const groups: Record<string, CheckIn[]> = {};
        filtered.forEach((c) => {
            const date = new Date(c.teeOffTime).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(c);
        });
        return groups;
    }, [filtered]);

    const groupedEntries = useMemo(
        () => Object.entries(grouped),
        [grouped]
    );

    const totalPages = Math.max(1, Math.ceil(groupedEntries.length / pageSize));
    const currentPageEntries = groupedEntries.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    // Chart data (count per day)
    const chartData = useMemo(() => {
        const map = new Map<string, number>();

        filtered.forEach((c) => {
            const date = new Date(c.teeOffTime).toLocaleDateString();
            map.set(date, (map.get(date) ?? 0) + 1);
        });

        return Array.from(map.entries()).map(([date, count]) => ({
            date,
            count,
        }));
    }, [filtered]);

    // CSV export
    const handleExportCsv = () => {
        const header = ["Name", "TeeOffTime"];
        const rows = filtered.map((c) => [
            c.name,
            new Date(c.teeOffTime).toISOString(),
        ]);
        const csv =
            [header, ...rows]
                .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
                .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "checkins.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mt-6 space-y-8">
            {/* Filters + actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <DateTimeRangePicker value={range} onChange={setRange} />

                <Button variant="outline" onClick={handleExportCsv}>
                    Export CSV
                </Button>
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Check-In Trend</CardTitle>
                </CardHeader>

                <CardContent>
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="fillCheckins" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-checkins)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-checkins)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid vertical={false} />

                            <XAxis
                                dataKey="date"
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
                                        labelFormatter={(value) => value}
                                    />
                                }
                            />

                            <Area
                                dataKey="count"
                                type="natural"
                                fill="url(#fillCheckins)"
                                stroke="var(--color-checkins)"
                            />

                            <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Grouped Table with pagination */}
            <div className="space-y-4">
                {currentPageEntries.map(([date, entries]) => (
                    <Card key={date}>
                        <CardHeader>
                            <CardTitle>{date}</CardTitle>
                        </CardHeader>

                        <CardContent>
                            <table className="w-full border-collapse">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Name</th>
                                    <th className="text-left p-2">Tee Off Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {entries.map((c, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="p-2">{c.name}</td>
                                        <td className="p-2">
                                            {new Date(c.teeOffTime).toLocaleTimeString()}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                ))}

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