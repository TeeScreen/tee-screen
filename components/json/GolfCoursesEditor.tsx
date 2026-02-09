"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import HolesEditor from "@/components/golf/HolesEditor";
import HandicapEditor from "@/components/json/HandicapEditor";
import HolesEditorWrapper from "../golf/HolesEditorWrapper";

export function GolfCoursesEditor({
                                      json,
                                      action,
                                  }: {
    json: any;
    action: (formData: FormData) => void;
}) {
    const [localJson, setLocalJson] = useState(json);
    const hiddenRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        defaultValues: localJson,
    });

    function updateJson(newJson: any) {
        setLocalJson(newJson);
        if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(newJson);
    }

    const courseLatLon = {
        lat: json?.GolfCourseLatLon?.x ?? 0,
        lon: json?.GolfCourseLatLon?.y ?? 0,
    };

    function updateCourse(courseName: string, path: string, value: any) {
        const updated = structuredClone(localJson);
        const course = updated.golfCoursesData[courseName];

        const keys = path.split(".");
        let current = course;

        keys.forEach((key, idx) => {
            if (idx === keys.length - 1) {
                current[key] = value;
            } else {
                current = current[key];
            }
        });

        updated.golfCoursesData[courseName] = course;
        updateJson(updated);
    }

    function addCourse() {
        const name = prompt("Course name?");
        if (!name) return;

        const updated = structuredClone(localJson);

        updated.golfCoursesData[name] = {
            holesData: Array.from({ length: 18 }).map((_, i) => ({
                holeNumber: i + 1,
                holePointLatLong: { x: 0, y: 0 },
                whiteTeePointLatLong: { x: 0, y: 0 },
                redTeePointLatLong: { x: 0, y: 0 },
                yellowTeePointLatLong: { x: 0, y: 0 },
                yardsToHole: 0,
                redYardsToHole: 0,
                yellowYardsToHole: 0,
                whiteYardsToHole: 0,
                parNumber: "4",
                siNumber: "1",
                holeImageURL: "",
            })),
            handicapData: [],
        };

        updateJson(updated);
    }

    return (
        <form action={action} className="space-y-6">
            <Button type="button" onClick={addCourse}>
                Add New Course
            </Button>

            {/* TOP LEVEL: COURSES */}
            <Accordion type="multiple" className="space-y-4">
                {Object.entries(localJson.golfCoursesData).map(
                    ([courseName, courseData]: any) => (
                        <AccordionItem key={courseName} value={courseName}>
                            <AccordionTrigger className="text-xl font-semibold">
                                {courseName}
                            </AccordionTrigger>

                            <AccordionContent className="space-y-6">

                                {/* HOLES WRAPPER */}
                                <HolesEditorWrapper
                                    courseName={courseName}
                                    holesData={courseData.holesData}
                                    form={form}
                                    updateCourse={updateCourse}
                                    courseLatLon={courseLatLon}
                                />

                                {/* HANDICAP EDITOR */}
                                <HandicapEditor
                                    courseName={courseName}
                                    handicapData={courseData.handicapData}
                                    form={form}
                                    updateCourse={updateCourse}
                                    updateJson={updateJson}
                                    localJson={localJson}
                                />

                            </AccordionContent>
                        </AccordionItem>
                    )
                )}
            </Accordion>

            {/* HIDDEN JSON FIELD */}
            <input
                ref={hiddenRef}
                type="hidden"
                name="json"
                defaultValue={JSON.stringify(localJson)}
            />

            <Button type="submit">Save Changes</Button>
        </form>
    );
}