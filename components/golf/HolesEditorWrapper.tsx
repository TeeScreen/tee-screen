"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import HoleEditor from "./HoleEditor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const GlobalCourseMap = dynamic(
    () => import("@/components/golf/GlobalCourseMap"),
    { ssr: false }
);

type RGBA = { r: number; g: number; b: number; a: number };

type HolesEditorProps = {
    courseName: string;
    holesData: any[];
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateCourseBatch: (courseName: string, updates: Record<string, any>) => void;
    courseLatLon?: { lat: number; lon: number };

    // NEW — global tee settings from GolfCoursesEditor
    teeSettings: {
        whiteTeeLabel: string;
        yellowTeeLabel: string;
        redTeeLabel: string;

        TeeColourWhite: RGBA;
        TeeColourYellow: RGBA;
        TeeColourRed: RGBA;
    };
};

export default function HolesEditor({
                                        courseName,
                                        holesData,
                                        form,
                                        updateCourse,
                                        updateCourseBatch,
                                        courseLatLon,
                                        teeSettings,
                                    }: HolesEditorProps) {
    const [globalMapOpen, setGlobalMapOpen] = useState(false);
    const [activeHoleIndex, setActiveHoleIndex] = useState<number | null>(null);

    // ⭐ Normalize coordinates to prevent undefined lat/lon
    const normalizedHoles = holesData.map((hole, i) => ({
        holeNumber: i + 1,
        holePointLatLong: {
            lat: hole.holePointLatLong?.x ?? courseLatLon?.lat ?? 0,
            lon: hole.holePointLatLong?.y ?? courseLatLon?.lon ?? 0,
        },
        whiteTeePointLatLong: {
            lat: hole.whiteTeePointLatLong?.x ?? courseLatLon?.lat ?? 0,
            lon: hole.whiteTeePointLatLong?.y ?? courseLatLon?.lon ?? 0,
        },
        yellowTeePointLatLong: {
            lat: hole.yellowTeePointLatLong?.x ?? courseLatLon?.lat ?? 0,
            lon: hole.yellowTeePointLatLong?.y ?? courseLatLon?.lon ?? 0,
        },
        redTeePointLatLong: {
            lat: hole.redTeePointLatLong?.x ?? courseLatLon?.lat ?? 0,
            lon: hole.redTeePointLatLong?.y ?? courseLatLon?.lon ?? 0,
        },
    }));

    return (
        <div className="space-y-6 border rounded p-4">

            {/* GLOBAL MAP BUTTON */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Course Map Overview</h3>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setGlobalMapOpen(true)}
                >
                    Open Global Map
                </Button>
            </div>

            {/* GLOBAL MAP MODAL */}
            <Dialog open={globalMapOpen} onOpenChange={setGlobalMapOpen}>
                <DialogContent className="w-screen max-w-none min-w-[80%] h-[90%] p-0 overflow-hidden">
                    <DialogHeader className="p-4">
                        <DialogTitle>Global Course Map</DialogTitle>
                    </DialogHeader>

                    <div className="w-full h-[calc(90vh-60px)]">
                        <GlobalCourseMap
                            holes={normalizedHoles}
                            clubLocation={courseLatLon ?? { lat: 0, lon: 0 }}

                            // ⭐ Pass tee colours + labels to global map
                            teeSettings={teeSettings}

                            onConfirm={async (updatedHoles) => {
                                const updates: Record<string, any> = {};

                                updatedHoles.forEach((h) => {
                                    const index = h.holeNumber - 1;

                                    updates[`holesData.${index}.holePointLatLong.x`] = h.holePointLatLong.lat;
                                    updates[`holesData.${index}.holePointLatLong.y`] = h.holePointLatLong.lon;

                                    updates[`holesData.${index}.whiteTeePointLatLong.x`] = h.whiteTeePointLatLong.lat;
                                    updates[`holesData.${index}.whiteTeePointLatLong.y`] = h.whiteTeePointLatLong.lon;

                                    updates[`holesData.${index}.yellowTeePointLatLong.x`] = h.yellowTeePointLatLong.lat;
                                    updates[`holesData.${index}.yellowTeePointLatLong.y`] = h.yellowTeePointLatLong.lon;

                                    updates[`holesData.${index}.redTeePointLatLong.x`] = h.redTeePointLatLong.lat;
                                    updates[`holesData.${index}.redTeePointLatLong.y`] = h.redTeePointLatLong.lon;
                                });

                                updateCourseBatch(courseName, updates);

                                await Promise.resolve();
                                setGlobalMapOpen(false);
                                toast.success("Changes saved successfully");
                            }}
                            onCancel={() => setGlobalMapOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* HOLE BUTTON GRID */}
            <div className="space-y-3 border rounded p-3">
                <h3 className="font-semibold text-lg mb-2">Select a Hole</h3>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {holesData.map((_, i) => (
                        <Button
                            key={i}
                            variant={activeHoleIndex === i ? "default" : "outline"}
                            onClick={() => setActiveHoleIndex(i)}
                        >
                            Hole {i + 1}
                        </Button>
                    ))}
                </div>
            </div>

            {/* ACTIVE HOLE EDITOR */}
            {activeHoleIndex !== null && (
                <div className="border rounded p-4">
                    <HoleEditor
                        key={activeHoleIndex}
                        value={`hole-${activeHoleIndex}`}
                        courseName={courseName}
                        hole={holesData[activeHoleIndex]}
                        index={activeHoleIndex}
                        form={form}
                        updateCourse={updateCourse}
                        updateCourseBatch={updateCourseBatch}
                        courseLatLon={courseLatLon}

                        // ⭐ Pass tee settings to HoleEditor
                        teeSettings={teeSettings}
                    />
                </div>
            )}
        </div>
    );
}
