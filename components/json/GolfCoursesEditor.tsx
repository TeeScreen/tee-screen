"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import HolesEditorWrapper from "../golf/HolesEditorWrapper";
import HandicapEditor from "@/components/json/HandicapEditor";
import { useDirtyState } from "@/stores/user-store";

export function GolfCoursesEditor({
                                      json,
                                      action,
                                  }: {
    json: any;
    action: (formData: FormData) => void;
}) {
    const [localJson, setLocalJson] = useState(json);
    const hiddenRef = useRef<HTMLInputElement>(null);
    const saveTimer = useRef<NodeJS.Timeout | null>(null);

    const { setDirty } = useDirtyState();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm({
        defaultValues: localJson,
    });

    // Sync when server sends new JSON
    useEffect(() => {
        setLocalJson(json);
        if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(json);
    }, [json]);

    // Auto-save with debounce
    const autoSave = (updatedJson: any) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);

        saveTimer.current = setTimeout(async () => {
            setIsSaving(true);

            const formData = new FormData();
            formData.append("json", JSON.stringify(updatedJson));

            await action(formData);

            setIsSaving(false);
            setDirty(true);
        }, 500);
    };

    function updateJson(newJson: any) {
        setLocalJson(newJson);

        if (hiddenRef.current) {
            hiddenRef.current.value = JSON.stringify(newJson);
        }

        autoSave(newJson);
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
        <div className="space-y-6">
            <Button type="button" onClick={addCourse}>
                Add New Course
            </Button>

            <Accordion type="multiple" className="space-y-4">
                {Object.entries(localJson.golfCoursesData).map(
                    ([courseName, courseData]: any) => (
                        <AccordionItem key={courseName} value={courseName}>
                            <AccordionTrigger className="text-xl font-semibold flex items-center gap-2">
                                <span>{courseName}</span>

                                {isSaving && (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </AccordionTrigger>

                            <AccordionContent className="space-y-6">
                                <HolesEditorWrapper
                                    courseName={courseName}
                                    holesData={courseData.holesData}
                                    form={form}
                                    updateCourse={updateCourse}
                                    courseLatLon={courseLatLon}
                                />

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

            {/* Hidden JSON field for server action */}
            <input
                ref={hiddenRef}
                type="hidden"
                name="json"
                defaultValue={JSON.stringify(localJson)}
            />
        </div>
    );
}