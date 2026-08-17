"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScheduleEntry } from "./ScheduleUploader";

// Convert ISO datetime -> HH:MM
function toTime(value: string): string {
    if (!value) return "";
    try {
        const d = new Date(value);
        const hh = d.getHours().toString().padStart(2, "0");
        const mm = d.getMinutes().toString().padStart(2, "0");
        return `${hh}:${mm}`;
    } catch {
        return "";
    }
}

function updateCell(
    table: any,
    rowIndex: number,
    field: keyof ScheduleEntry,
    value: any
) {
    // Grab the full dataset from meta
    const setData = table.options.meta?.setData as React.Dispatch<
        React.SetStateAction<ScheduleEntry[]>
    >;

    // Use the updater form of setData so you always have the latest state
    setData((prev) => {
        const updated = [...prev];
        // Find the global index by matching the row’s unique identifier
        const row = table.options.data[rowIndex];
        const globalIndex = prev.findIndex(
            (e) => e.start === row.start && e.end === row.end
        );

        if (globalIndex !== -1) {
            updated[globalIndex] = { ...updated[globalIndex], [field]: value };
        }
        return updated;
    });
}


function EditableCell({ row, column, table }: any) {
    const field = column.id as keyof ScheduleEntry;
    return (
        <Input
            value={row.original[field] || ""}
            onChange={(e) => updateCell(table, row.index, field, e.target.value)}
        />
    );
}

function TimeCell({ row, column, table }: any) {
    const field = column.id as keyof ScheduleEntry;
    const value = toTime(row.original[field] as string);

    return (
        <Input
            type="time"
            value={value}
            onChange={(e) => {
                const [hh, mm] = e.target.value.split(":");
                const date = new Date(row.original[field]);

                date.setHours(Number(hh), Number(mm), 0, 0);

                // Save as local ISO without timezone
                const localIso = `${date.getFullYear()}-${(date.getMonth()+1)
                    .toString().padStart(2,"0")}-${date.getDate()
                    .toString().padStart(2,"0")}T${hh}:${mm}:00`;

                updateCell(table, row.index, field, localIso);
            }}
        />
    );
}

function ColorCell({ row, column, table }: any) {
    const field = column.id as keyof ScheduleEntry;
    const col = row.original[field];
    const hex =
        typeof col === "object"
            ? "#" +
            [col.r, col.g, col.b].map((x: number) => x.toString(16).padStart(2, "0")).join("")
            : (col as string) || "#ffffff";

    return (
        <Input
            type="color"
            value={hex}
            onChange={(e) => {
                const r = parseInt(e.target.value.slice(1, 3), 16);
                const g = parseInt(e.target.value.slice(3, 5), 16);
                const b = parseInt(e.target.value.slice(5, 7), 16);
                updateCell(table, row.index, field, { r, g, b, a: 255 });
            }}
            className="h-10 w-16 p-1"
        />
    );
}

export const columns: ColumnDef<ScheduleEntry>[] = [
    { accessorKey: "start", header: "Start", cell: TimeCell },
    { accessorKey: "end", header: "End", cell: TimeCell },
    { accessorKey: "topNotice", header: "Top Notice", cell: EditableCell },
    { accessorKey: "middleNotice", header: "Middle Notice", cell: EditableCell },
    { accessorKey: "bottomNotice", header: "Bottom Notice", cell: EditableCell },
    { accessorKey: "topColour", header: "Top Colour", cell: ColorCell },
    { accessorKey: "middleColour", header: "Middle Colour", cell: ColorCell },
    { accessorKey: "bottomColour", header: "Bottom Colour", cell: ColorCell },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row, table }) => (
            <div className="flex gap-2">
                <Button
                    variant="secondary"
                    onClick={() => {
                        const data = [...(table.options.data as ScheduleEntry[])];
                        data.splice(row.index, 0, { ...row.original }); // duplicate row
                        table.options.meta?.updateData?.(data);
                    }}
                >
                    Duplicate
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => {
                        const data = [...(table.options.data as ScheduleEntry[])];
                        data.splice(row.index, 1);
                        table.options.meta?.updateData?.(data);
                    }}
                >
                    Delete
                </Button>
            </div>
        ),
    },
];
