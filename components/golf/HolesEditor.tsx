"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Accordion } from "@/components/ui/accordion";
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

type HolesEditorProps = {
    courseName: string;
    holesData: any[];
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateCourseBatch: (courseName: string, updates: Record<string, any>) => void;
    courseLatLon?: { lat: number; lon: number };
};

export default function AltHolesEditor({
                                        courseName,
                                        holesData,
                                        form,
                                        updateCourse,
                                        updateCourseBatch,
                                        courseLatLon,
                                    }: HolesEditorProps) {
    const holeIds = holesData.map((_, i) => `hole-${i}`);
    const [openHoles, setOpenHoles] = useState<string[]>([]);
    const [globalMapOpen, setGlobalMapOpen] = useState(false);

    const expandAllHoles = () => setOpenHoles(holeIds);
    const collapseAllHoles = () => setOpenHoles([]);

    // 🔥 FIX: Always read the latest values from the form
    const watchedHoles = form.watch("holesData") ?? holesData;

    const globalHoles = watchedHoles.map((hole: any, i: number) => ({
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
                <DialogContent className="w-screen max-w-none min-w-[80%] h-[90vh] p-0 overflow-hidden">
                    <DialogHeader className="p-4">
                        <DialogTitle>Global Course Map</DialogTitle>
                    </DialogHeader>

                    <div className="w-full h-[calc(90vh-60px)]">
                        <GlobalCourseMap
                            holes={globalHoles}
                            clubLocation={courseLatLon ?? { lat: 0, lon: 0 }}
                            onConfirm={async (updatedHoles) => {
                                updatedHoles.forEach((h) => {
                                    const index = h.holeNumber - 1;

                                    updateCourse(courseName, `holesData.${index}.holePointLatLong.x`, h.holePointLatLong.lat);
                                    updateCourse(courseName, `holesData.${index}.holePointLatLong.y`, h.holePointLatLong.lon);

                                    updateCourse(courseName, `holesData.${index}.whiteTeePointLatLong.x`, h.whiteTeePointLatLong.lat);
                                    updateCourse(courseName, `holesData.${index}.whiteTeePointLatLong.y`, h.whiteTeePointLatLong.lon);

                                    updateCourse(courseName, `holesData.${index}.yellowTeePointLatLong.x`, h.yellowTeePointLatLong.lat);
                                    updateCourse(courseName, `holesData.${index}.yellowTeePointLatLong.y`, h.yellowTeePointLatLong.lon);

                                    updateCourse(courseName, `holesData.${index}.redTeePointLatLong.x`, h.redTeePointLatLong.lat);
                                    updateCourse(courseName, `holesData.${index}.redTeePointLatLong.y`, h.redTeePointLatLong.lon);
                                });

                                form.trigger("holesData");

                                // Allow React to flush updates before closing modal
                                await Promise.resolve();

                                setGlobalMapOpen(false);

                                toast.success("Changes saved successfully");
                            }}
                            onCancel={() => setGlobalMapOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* HOLE-BY-HOLE EDITOR */}
            <div className="space-y-3 border rounded p-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Holes Data</h3>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={expandAllHoles}>
                            Expand All Holes
                        </Button>
                        <Button type="button" variant="outline" onClick={collapseAllHoles}>
                            Collapse All Holes
                        </Button>
                    </div>
                </div>

                <Accordion
                    type="multiple"
                    value={openHoles}
                    onValueChange={(val) => setOpenHoles(val as string[])}
                    className="border rounded p-2"
                >
                    {watchedHoles.map((hole: any, i: number) => (
                        <HoleEditor
                            key={i}
                            value={`hole-${i}`}
                            courseName={courseName}
                            hole={hole}
                            index={i}
                            form={form}
                            updateCourse={updateCourse}
                            updateCourseBatch={updateCourseBatch}
                            courseLatLon={courseLatLon}
                        />
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
