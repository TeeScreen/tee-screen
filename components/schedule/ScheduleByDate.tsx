"use client";

import React, { useState } from "react";
import { DataTable } from "./DataTable";
import { columns } from "./Columns";
import { ScheduleEntry } from "./ScheduleUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {nowUnityIsoString, toUnityIsoStringFrom} from "@/lib/helper";

function groupByDate(entries: ScheduleEntry[]) {
  const grouped: Record<string, ScheduleEntry[]> = {};
  entries.forEach((entry) => {
    const date = new Date(entry.start).toISOString().slice(0, 10);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(entry);
  });
  Object.keys(grouped).forEach((d) => {
    grouped[d].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  });
  return grouped;
}

export default function ScheduleByDate({
                                         entries,
                                         setData,
                                       }: {
  entries: ScheduleEntry[];
  setData: React.Dispatch<React.SetStateAction<ScheduleEntry[]>>;
}) {
  const grouped = groupByDate(entries);
  const dates = Object.keys(grouped).sort();
  const [currentDate, setCurrentDate] = useState(dates[0] || "");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [newDateDialogOpen, setNewDateDialogOpen] = useState(false);

  const [copyTargetDate, setCopyTargetDate] = useState("");
  const [newDateValue, setNewDateValue] = useState("");

  const currentEntries = grouped[currentDate] || [];

  const copyDay = (targetDate: string) => {
    if (!targetDate) return;
    const newEntries = [
      ...entries,
      ...currentEntries.map((e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        const [y, m, d] = targetDate.split("-");
        start.setFullYear(+y, +m - 1, +d);
        end.setFullYear(+y, +m - 1, +d);
        return { ...e, start: start.toISOString(), end: end.toISOString() };
      }),
    ];
    setData(newEntries);
    setCurrentDate(targetDate);
    setCopyDialogOpen(false);
    setCopyTargetDate("");
    toast.success(`Copied schedule from ${currentDate} to ${targetDate}`);
  };

  const deleteDay = (date: string) => {
    const newEntries = entries.filter(
        (e) => new Date(e.start).toISOString().slice(0, 10) !== date
    );
    setData(newEntries);
    setCurrentDate("");
    setDeleteDialogOpen(false);
    toast.success(`Deleted all entries for ${date}`);
  };

  const addNewDate = (newDate: string) => {
    if (!newDate) return;
    const newEntry: ScheduleEntry = {
      start: new Date(`${newDate}T09:00:00`).toISOString(),
      end: new Date(`${newDate}T10:00:00`).toISOString(),
      topNotice: "",
      middleNotice: "",
      bottomNotice: "",
      topColour: "#ffffff",
      middleColour: "#ffffff",
      bottomColour: "#ffffff",
    };
    setData([...entries, newEntry]);
    setCurrentDate(newDate);
    setNewDateDialogOpen(false);
    setNewDateValue("");
    toast.success(`Created new schedule for ${newDate}`);
  };

  const addRow = () => {
    if (!currentDate) return;

    // Build a Date object from the selected YYYY-MM-DD
    const [y, m, d] = currentDate.split("-").map(Number);
    const base = new Date(y, m - 1, d, 7, 0, 0, 0);

    const newEntry: ScheduleEntry = {
      start: toUnityIsoStringFrom(base, 0),   // 00:00 on currentDate
      end:   toUnityIsoStringFrom(base, 1),   // 01:00 on currentDate
      topNotice: "",
      middleNotice: "",
      bottomNotice: "",
      topColour: { r: 255, g: 255, b: 255, a: 255 },
      middleColour: { r: 255, g: 255, b: 255, a: 255 },
      bottomColour: { r: 255, g: 255, b: 255, a: 255 }
    };

    setData(prev => [...prev, newEntry]);
  };

  const updateData = (updatedDay: ScheduleEntry[]) => {
    setData(prev => {
      const currentDateStr = currentDate; // YYYY-MM-DD

      return [
        // keep all other days
        ...prev.filter(e =>
            new Date(e.start).toISOString().slice(0, 10) !== currentDateStr
        ),

        // insert updated day
        ...updatedDay
      ];
    });
  };

  return (
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <label className="font-medium">Select Date:</label>
          <Input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
          />

          <Button
              onClick={() => setCopyDialogOpen(true)}
              disabled={!currentEntries.length}
          >
            Copy Day
          </Button>

          <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!currentEntries.length}
          >
            Delete All for {currentDate}
          </Button>

          <Button variant="secondary" onClick={() => setNewDateDialogOpen(true)}>
            New Date
          </Button>
        </div>

        {/* Active dates list */}
        <div className="flex gap-2 flex-wrap">
          {dates.map((d) => (
              <Button
                  key={d}
                  onClick={() => setCurrentDate(d)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${
                      d === currentDate
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                {d}
              </Button>
          ))}
        </div>
        {/* Row Controls */}
        <div className="flex items-center gap-2">
          <Button onClick={addRow}>Add Row</Button>
        </div>

        <DataTable columns={columns} data={currentEntries} setData={setData} updateData={updateData} />

        {/* Copy Day Dialog */}
        <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy Day</DialogTitle>
              <DialogDescription>
                Select a target date to copy all entries from {currentDate}.
              </DialogDescription>
            </DialogHeader>
            <Input
                type="date"
                value={copyTargetDate}
                onChange={(e) => setCopyTargetDate(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                  onClick={() => copyDay(copyTargetDate)}
                  disabled={!copyTargetDate}
              >
                Confirm Copy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Day Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Entries</DialogTitle>
              <DialogDescription>
                This will permanently remove all rows for {currentDate}. Are you sure?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                  variant="destructive"
                  onClick={() => deleteDay(currentDate)}
              >
                Confirm Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Date Dialog */}
        <Dialog open={newDateDialogOpen} onOpenChange={setNewDateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Date</DialogTitle>
              <DialogDescription>
                Select a date to create a new schedule entry.
              </DialogDescription>
            </DialogHeader>
            <Input
                type="date"
                value={newDateValue}
                onChange={(e) => setNewDateValue(e.target.value)}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewDateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                  onClick={() => addNewDate(newDateValue)}
                  disabled={!newDateValue}
              >
                Confirm Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  );
}
