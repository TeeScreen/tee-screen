"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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

export interface DateTimeRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface Props {
    value: DateTimeRange;
    onChange: (range: DateTimeRange) => void;
}

export default function DateTimeRangePicker({ value, onChange }: Props) {
    const setPreset = (preset: "all" | "today" | "7d" | "30d") => {
        if (preset === "all") {
            onChange({ from: undefined, to: undefined });
            return;
        }

        const now = new Date();
        const to = endOfDay(now);
        let from: Date;

        if (preset === "today") {
            from = startOfDay(now);
        } else if (preset === "7d") {
            from = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000));
        } else {
            from = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));
        }

        onChange({ from, to });
    };

    const handleCalendarSelect = (range: any) => {
        if (!range) {
            onChange({ from: undefined, to: undefined });
            return;
        }

        let from = range.from ? startOfDay(range.from) : undefined;
        let to = range.to ? endOfDay(range.to) : undefined;

        onChange({ from, to });
    };

    const handleTimeChange = (type: "from" | "to", time: string) => {
        const [h, m] = time.split(":").map(Number);
        const current = value[type];
        if (!current) return;

        const updated = new Date(current);
        updated.setHours(h ?? 0, m ?? 0, 0, 0);

        onChange({
            ...value,
            [type]: updated,
        });
    };

    const fromTime = value.from
        ? `${String(value.from.getHours()).padStart(2, "0")}:${String(
            value.from.getMinutes()
        ).padStart(2, "0")}`
        : "";

    const toTime = value.to
        ? `${String(value.to.getHours()).padStart(2, "0")}:${String(
            value.to.getMinutes()
        ).padStart(2, "0")}`
        : "";

    const isFiltered = Boolean(value.from || value.to);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant={!isFiltered ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPreset("all")}
                >
                    All time
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreset("today")}>
                    Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreset("7d")}>
                    Last 7 days
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPreset("30d")}>
                    Last 30 days
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={isFiltered ? "secondary" : "outline"}
                            className="w-[260px] justify-start text-left font-normal"
                        >
                            {value.from && value.to
                                ? `${value.from.toLocaleDateString()} → ${value.to.toLocaleDateString()}`
                                : value.from
                                ? `From ${value.from.toLocaleDateString()}`
                                : "Custom range…"}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0" align="start">
                        <Calendar
                            mode="range"
                            selected={value}
                            onSelect={handleCalendarSelect}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {isFiltered && (
                <div className="flex flex-wrap items-center gap-3 animate-in fade-in-50 duration-150">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">From time</span>
                        <input
                            type="time"
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value={fromTime}
                            onChange={(e) => handleTimeChange("from", e.target.value)}
                            disabled={!value.from}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">To time</span>
                        <input
                            type="time"
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value={toTime}
                            onChange={(e) => handleTimeChange("to", e.target.value)}
                            disabled={!value.to}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
