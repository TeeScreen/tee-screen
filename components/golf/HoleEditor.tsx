"use client";

import React from "react";
import HoleCoordinatesEditor from "./HoleCoordinatesEditor";
import HoleYardageEditor from "./HoleYardageEditor";
import HoleDetailsEditor from "./HoleDetailsEditor";

type RGBA = { r: number; g: number; b: number; a: number };

type HoleEditorProps = {
    value: string;
    courseName: string;
    hole: any;
    index: number;
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateCourseBatch: (courseName: string, updates: Record<string, any>) => void;
    courseLatLon?: { lat: number; lon: number };

    // NEW — global tee settings passed from HolesEditorWrapper
    teeSettings: {
        whiteTeeLabel: string;
        yellowTeeLabel: string;
        redTeeLabel: string;

        TeeColourWhite: RGBA;
        TeeColourYellow: RGBA;
        TeeColourRed: RGBA;
    };
};

export default function HoleEditor({
                                       courseName,
                                       hole,
                                       index,
                                       form,
                                       updateCourse,
                                       updateCourseBatch,
                                       courseLatLon,
                                       teeSettings,
                                   }: HoleEditorProps) {
    return (
        <div className="space-y-6">

            {/* HEADER */}
            <h3 className="text-xl font-semibold">
                Hole {hole.holeNumber ?? index + 1}
            </h3>

            {/* --- YARDAGES SECTION --- */}
            <div className="border rounded p-3 space-y-3">
                <h4 className="font-semibold text-base">Yardages</h4>

                <HoleYardageEditor
                    courseName={courseName}
                    hole={hole}
                    index={index}
                    form={form}
                    updateCourse={updateCourse}
                    teeSettings={teeSettings}   // ✔ dynamic tee labels
                />
            </div>

            {/* --- DETAILS SECTION --- */}
            <div className="border rounded p-3 space-y-3">
                <h4 className="font-semibold text-base">Details</h4>

                <HoleDetailsEditor
                    courseName={courseName}
                    hole={hole}
                    index={index}
                    form={form}
                    updateCourse={updateCourse}
                />
            </div>

            {/* --- COORDINATES SECTION --- */}
            <div className="border rounded p-3 space-y-3">
                <h4 className="font-semibold text-base">Coordinates</h4>

                <HoleCoordinatesEditor
                    courseName={courseName}
                    hole={hole}
                    index={index}
                    form={form}
                    updateCourse={updateCourse}
                    updateCourseBatch={updateCourseBatch}
                    courseLatLon={courseLatLon}
                    teeSettings={teeSettings}   // ✔ dynamic labels + colours
                />
            </div>

        </div>
    );
}
