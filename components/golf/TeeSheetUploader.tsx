"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {SERVER_URL} from "@/lib/constants";

export type TeeSlot = {
    teeTime: string;
    player1: string;
    player2: string;
    player3: string;
    player4: string;
};


export default function TeeSheetUploader({
                                             folderName,
                                             frontNine
                                         }: {
                                            folderName: string;
                                            frontNine: boolean; })
{
    const [slots, setSlots] = useState<TeeSlot[]>([]);
    const [saving, setSaving] = useState(false);

    // -----------------------------------------
    // COLUMN-DRIVEN NORMALIZER (Based on your sheet)
    // -----------------------------------------
    const normalizeRow = (row: any): TeeSlot => {
        let teeTime = "";
        const players: string[] = [];

        const keys = Object.keys(row);

        // First column containing "time" → teeTime
        const timeKey = keys.find(k => k.toLowerCase().includes("time"));
        if (timeKey && row[timeKey]) {
            teeTime = new Date(row[timeKey]).toISOString();
        }

        // All columns containing "player" → players[]
        const playerKeys = keys.filter(k => k.toLowerCase().includes("player"));
        playerKeys.forEach(k => {
            players.push(row[k] || "");
        });

        // Guarantee exactly 4 players
        while (players.length < 4) players.push("");
        const [player1, player2, player3, player4] = players.slice(0, 4);

        return { teeTime, player1, player2, player3, player4 };
    };

    // -----------------------------------------
    // CSV PARSER
    // -----------------------------------------
    const parseCsv = (text: string): TeeSlot[] => {
        const rows = text.split("\n").map(r => r.split(","));
        const headers = rows[0].map(h => h.trim());

        return rows.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((h, i) => {
                obj[h] = row[i]?.trim() || "";
            });
            return normalizeRow(obj);
        });
    };

    // -----------------------------------------
    // XLSX PARSER
    // -----------------------------------------
    const parseXlsx = (buffer: ArrayBuffer): TeeSlot[] => {
        const workbook = XLSX.read(buffer);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Read raw rows (arrays)
        const raw = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });

        let headerRowIndex = -1;
        let timeColumn = -1;
        let playerColumns: number[] = [];

        let date = new Date().toDateString();

        // -----------------------------------------
        // 1. FIND HEADER ROW + COLUMN INDEXES
        // -----------------------------------------
        for (let i = 0; i < 10; i++) {
            const row = raw[i];
            if (!row) continue;
            row.forEach((cell: any, colIndex: number) => {
                if (typeof cell !== "string") return;

                const lower = cell.toLowerCase();

                if (lower.includes("time") && timeColumn === -1) {
                    timeColumn = colIndex;
                    headerRowIndex = i;
                }

                if (lower.includes("player")) {
                    playerColumns.push(colIndex);
                    headerRowIndex = i;
                }

                if (
                    lower.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/) // 12/08/2024 or 12-08-24
                ) {
                    date = lower;
                }
            });

            if (headerRowIndex !== -1) break;
        }

        if (headerRowIndex === -1 || timeColumn === -1 || playerColumns.length === 0) {
            console.error("Could not detect header row or columns");
            return [];
        }

        // -----------------------------------------
        // 2. PARSE DATA ROWS USING COLUMN INDEXES
        // -----------------------------------------
        const slots: TeeSlot[] = [];

        for (let i = headerRowIndex + 1; i < raw.length; i++) {
            const row = raw[i];
            if (!row) continue;

            const timeCell = row[timeColumn];
            if (!timeCell || typeof timeCell !== "string") continue;

            // Detect tee time format
            if (!timeCell.match(/\d{1,2}:\d{2}/)) continue;

            const teeTime = `${date} ${timeCell}`;

            // Extract players
            const players = playerColumns.map(col => row[col] || "");

            // Guarantee 4 players
            while (players.length < 4) players.push("");

            const [player1, player2, player3, player4] = players.slice(0, 4);

            slots.push({ teeTime, player1, player2, player3, player4 });
        }

        return slots;
    };


    // -----------------------------------------
    // FILE UPLOAD HANDLER
    // -----------------------------------------
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            if (file.name.endsWith(".csv")) {
                const text = await file.text();
                setSlots(parseCsv(text));
                toast.success("CSV tee sheet loaded");
            } else {
                const buffer = await file.arrayBuffer();
                setSlots(parseXlsx(buffer));
                toast.success("XLSX tee sheet loaded");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to parse tee sheet");
        }
    };

    // -----------------------------------------
    // SAVE TO NEW ENDPOINT
    // -----------------------------------------
    const saveTeeSheet = async () => {
        if (!folderName) {
            toast.error("Missing folder name");
            return;
        }

        setSaving(true);

        try {
            const url = `${SERVER_URL}/upload_teesheet.php`;
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    folderName,
                    frontNine,
                    slots
                })
            });

            console.log("Response for UploadTee Sheet " , res);

            if (res.ok) {
                toast.success("Tee sheet saved successfully");
            } else {
                toast.error("Failed to save tee sheet: " + (await res.text()));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error saving tee sheet");
        } finally {
            setSaving(false);
        }
    };

    const formatTeeTime = (iso: string) => {
        if (!iso) return "";
        const date = new Date(iso);

        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
    };

    const formatTeeDate = (iso: string) => {
        if (!iso) return "";
        const date = new Date(iso);

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };


    return (
        <div className="space-y-8">
            {/* Upload */}
            <div className="flex items-center gap-4">
                <Input type="file" accept=".xlsx,.csv" onChange={handleUpload} />
                <Button asChild>
                    <a href="/teesheet-template.csv" download>
                        Download Tee Sheet Template
                    </a>
                </Button>
            </div>

            {/* Save */}
            <div className="flex items-center gap-4">
                <Button onClick={saveTeeSheet} disabled={saving} variant="secondary">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Tee Sheet"
                    )}
                </Button>
            </div>

            <Accordion type="multiple" className="border rounded p-2">
                <AccordionItem value="results">
                    <AccordionTrigger className="text-lg font-medium">
                        Tee Slots Data : {formatTeeDate(slots[1]?.teeTime) ?? "No Tee Set"}
                    </AccordionTrigger>

                    <AccordionContent className="space-y-4">
                        {/* Tee Slots */}
                        <div className="space-y-4">
                            {slots.map((slot, i) => (
                                <div
                                    key={i}
                                    className="border rounded p-4 flex flex-col gap-2 bg-muted/30"
                                >
                                    <div className="font-semibold text-lg">
                                        Tee Time: {formatTeeTime(slot.teeTime)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>Player 1: {slot.player1}</div>
                                        <div>Player 2: {slot.player2}</div>
                                        <div>Player 3: {slot.player3}</div>
                                        <div>Player 4: {slot.player4}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
