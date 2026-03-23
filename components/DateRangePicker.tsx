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
    const setPreset = (preset: "today" | "7d" | "30d") => {
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

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
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
                            variant="outline"
                            className="w-[260px] justify-start text-left font-normal"
                        >
                            {value.from && value.to
                                ? `${value.from.toLocaleDateString()} → ${value.to.toLocaleDateString()}`
                                : "Select date range"}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="p-0">
                        <Calendar
                            mode="range"
                            selected={value}
                            onSelect={(range) => onChange(range as any)}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">From time</span>
                    <input
                        type="time"
                        className="h-9 rounded-md border px-2 text-sm"
                        value={fromTime}
                        onChange={(e) => handleTimeChange("from", e.target.value)}
                        disabled={!value.from}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">To time</span>
                    <input
                        type="time"
                        className="h-9 rounded-md border px-2 text-sm"
                        value={toTime}
                        onChange={(e) => handleTimeChange("to", e.target.value)}
                        disabled={!value.to}
                    />
                </div>
            </div>
        </div>
    );
}