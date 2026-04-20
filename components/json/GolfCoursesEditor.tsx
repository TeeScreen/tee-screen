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
import { Loader2, Pencil } from "lucide-react";

import HolesEditorWrapper from "../golf/HolesEditorWrapper";
import HandicapEditor from "@/components/json/HandicapEditor";
import { useDirtyState } from "@/stores/user-store";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

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

    // -----------------------------
    // COURSE NAME DIALOG STATE
    // -----------------------------
    const [courseDialogOpen, setCourseDialogOpen] = useState(false);
    const [courseDialogMode, setCourseDialogMode] = useState<"add" | "rename">("add");
    const [courseNameInput, setCourseNameInput] = useState("");
    const [courseNameOriginal, setCourseNameOriginal] = useState<string | null>(null);

    function openAddCourseDialog() {
        setCourseDialogMode("add");
        setCourseNameInput("");
        setCourseNameOriginal(null);
        setCourseDialogOpen(true);
    }

    function openRenameCourseDialog(oldName: string) {
        setCourseDialogMode("rename");
        setCourseNameInput(oldName);
        setCourseNameOriginal(oldName);
        setCourseDialogOpen(true);
    }

    // -----------------------------
    // AUTOSAVE
    // -----------------------------
    useEffect(() => {
        setLocalJson(json);
        if (hiddenRef.current) hiddenRef.current.value = JSON.stringify(json);
    }, [json]);

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

    // -----------------------------
    // UPDATE FUNCTIONS
    // -----------------------------
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

    function updateCourseBatch(
        courseName: string,
        updates: Record<string, any>
    ) {
        const updated = structuredClone(localJson);
        const course = updated.golfCoursesData[courseName];

        for (const path in updates) {
            const value = updates[path];
            const keys = path.split(".");
            let current = course;

            keys.forEach((key, idx) => {
                if (idx === keys.length - 1) {
                    current[key] = value;
                } else {
                    current = current[key];
                }
            });
        }

        updated.golfCoursesData[courseName] = course;
        updateJson(updated);
    }

    // -----------------------------
    // ADD COURSE
    // -----------------------------
    function addCourse(name: string) {
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

    // -----------------------------
    // RENAME COURSE
    // -----------------------------
    function renameCourse(oldName: string, newName: string) {
        if (!newName || newName.trim() === "" || newName === oldName) return;

        const updated = structuredClone(localJson);

        updated.golfCoursesData[newName] = updated.golfCoursesData[oldName];
        delete updated.golfCoursesData[oldName];

        updateJson(updated);
    }

    return (
        <div className="space-y-6">
            {/* ADD COURSE BUTTON */}
            <Button type="button" onClick={openAddCourseDialog}>
                Add New Course
            </Button>

            {/* COURSE LIST */}
            <Accordion type="multiple" className="space-y-4">
                {Object.entries(localJson.golfCoursesData).map(
                    ([courseName, courseData]: any) => (
                        <AccordionItem key={courseName} value={courseName}>
                            <AccordionTrigger className="text-xl font-semibold flex items-center gap-3">

                                {/* Course Title + Edit Button */}
                                <div className="flex items-center gap-2">
                                    <span>{courseName}</span>

                                    <span
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openRenameCourseDialog(courseName);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.stopPropagation();
                                                openRenameCourseDialog(courseName);
                                            }
                                        }}
                                        className="h-6 w-6 flex items-center justify-center rounded-md opacity-70 hover:opacity-100 hover:bg-accent cursor-pointer"
                                                                        >
                                        <Pencil className="h-4 w-4" />
                                    </span>

                                </div>

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
                                    updateCourseBatch={updateCourseBatch}
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

            {/* HIDDEN JSON FIELD */}
            <input
                ref={hiddenRef}
                type="hidden"
                name="json"
                defaultValue={JSON.stringify(localJson)}
            />

            {/* COURSE NAME DIALOG */}
            <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {courseDialogMode === "add"
                                ? "Add New Course"
                                : "Rename Course"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the course name below.
                        </DialogDescription>
                    </DialogHeader>

                    <input
                        className="w-full border rounded p-2"
                        value={courseNameInput}
                        onChange={(e) => setCourseNameInput(e.target.value)}
                        placeholder="Course name"
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setCourseDialogOpen(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={() => {
                                if (courseDialogMode === "add") {
                                    addCourse(courseNameInput);
                                } else if (courseNameOriginal) {
                                    renameCourse(courseNameOriginal, courseNameInput);
                                }
                                setCourseDialogOpen(false);
                            }}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
