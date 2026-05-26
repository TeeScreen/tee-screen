"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScheduleByDate from "./ScheduleByDate";
import { toast } from "sonner";

export type ScheduleEntry = {
    start: string;
    end: string;
    topNotice: string;
    middleNotice: string;
    bottomNotice: string;
    topColour: any;   // stored as RGBA object in JSON, hex string in CSV
    middleColour: any;
    bottomColour: any;
};

const ApiUrl = "https://teescreenapp.com/api/schedule";

export default function ScheduleUploader({ screenName }: { screenName: string }) {
    const [entries, setData] = useState<ScheduleEntry[]>([]);

    // Load schedule from server
    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await fetch(`${ApiUrl}?filename=${screenName}`);
                if (res.ok) {
                    const data = await res.json();
                    setData(data.entries || []);
                } else {
                    console.error("Failed to load schedule", await res.text());
                }
            } catch (err) {
                console.error("Failed to load schedule", err);
            }
        };
        fetchSchedule();
    }, [screenName]);

    // Upload CSV/XLSX
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.name.endsWith(".csv")) {
            const text = await file.text();
            const rows = text.split("\n").map((r) => r.split(","));
            const headers = rows[0];
            const parsed = rows.slice(1).map((row) => {
                const obj: any = {};
                headers.forEach((h, i) => {
                    obj[h.trim()] = row[i]?.trim();
                });
                // normalize start/end to ISO
                if (obj.start) obj.start = new Date(obj.start).toISOString();
                if (obj.end) obj.end = new Date(obj.end).toISOString();
                return obj;
            });
            setData(parsed);
        } else {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<any>(sheet);
            const normalized = rows.map((r) => ({
                ...r,
                start: r.start ? new Date(r.start).toISOString() : "",
                end: r.end ? new Date(r.end).toISOString() : "",
            }));
            setData(normalized);
        }
    };

    // Add blank row
    const addRow = () => {
        const newEntry: ScheduleEntry = {
            start: new Date().toISOString(),
            end: new Date().toISOString(),
            topNotice: "",
            middleNotice: "",
            bottomNotice: "",
            topColour: "#ffffff",
            middleColour: "#ffffff",
            bottomColour: "#ffffff",
        };
        setData([...entries, newEntry]);
    };

    // Save schedule
    const saveSchedule = async () => {
        try {
            const res = await fetch(ApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: screenName, entries }),
            });
            if (res.ok) {
                toast.message("Schedule saved successfully!");
            } else {
                toast.message("Failed to save schedule: " + (await res.text()));
            }
        } catch (err) {
            console.error("Error saving schedule", err);
        }
    };

    return (
        <div className="space-y-8">
            {/* Import / Template */}
            <div className="flex items-center gap-4">
                <Input type="file" accept=".xlsx,.csv" onChange={handleUpload} />
                <Button asChild>
                    <a href="/schedule-template.csv" download>
                        Download Template
                    </a>
                </Button>
            </div>

            {/* Row Controls */}
            <div className="flex items-center gap-4">
                <Button onClick={addRow}>Add Row</Button>
                {/* You can add a Delete Selected button here later */}
            </div>

            {/* Save Controls */}
            <div className="flex items-center gap-4">
                <Button onClick={saveSchedule} variant="secondary">
                    Save Schedule
                </Button>
            </div>

            {/* Data View */}
            <ScheduleByDate entries={entries} setData={setData} />
        </div>

    );
}
