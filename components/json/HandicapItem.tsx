"use client";

import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import { round } from "@floating-ui/utils";

const LABELS: Record<string, string> = {
    displayedName: "Colour",
    gender: "Gender",
    par: "Par",
    courseRating: "Course Rating",
    slopeRating: "Slope Rating",

    frontNinePar: "Front 9 Par",
    frontNineCourseRating: "Front 9 Course Rating",
    frontNineSlopeRating: "Front 9 Slope Rating",

    backNinePar: "Back 9 Par",
    backNineCourseRating: "Back 9 Course Rating",
    backNineSlopeRating: "Back 9 Slope Rating",
};

export default function HandicapItem({
                                         courseName,
                                         index,
                                         handicap,
                                         form,
                                         updateCourse,
                                         updateJson,
                                         localJson,
                                     }: {
    courseName: string;
    index: number;
    handicap: any;
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateJson: (json: any) => void;
    localJson: any;
}) {
    const title = handicap.teeName?.trim()
        ? handicap.teeName
        : `Handicap ${index + 1}`;

    function deleteHandicap() {
        const updated = structuredClone(localJson);
        updated.golfCoursesData[courseName].handicapData.splice(index, 1);
        updateJson(updated);
    }

    function updateBasicField(key: string, rawValue: any) {
        let newVal = rawValue;

        const isNumber =
            key.startsWith("par") ||
            key.startsWith("course") ||
            key.startsWith("slope");

        if (isNumber && !key.startsWith("course")) {
            newVal = round(newVal);
        }

        if (newVal === "" || newVal === null || newVal === undefined) {
            newVal = isNumber ? 0 : "";
        }

        const updated = structuredClone(localJson);
        const course = updated.golfCoursesData[courseName];
        const h = course.handicapData[index];

        h[key] = newVal;

        if (key === "displayedName" || key === "gender") {
            const colour = key === "displayedName" ? newVal : h.displayedName || "";
            const gender = key === "gender" ? newVal : h.gender || "";
            h.teeName = `${colour}-${gender}`.replace(/^-|-$/g, "");
        }

        updated.golfCoursesData[courseName] = course;
        updateJson(updated);

        return newVal;
    }

    return (
        <AccordionItem value={`handicap-${index}`}>
            <AccordionTrigger>{title}</AccordionTrigger>

            <AccordionContent className="space-y-4 p-2">
                <Button
                    variant="destructive"
                    type="button"
                    onClick={deleteHandicap}
                >
                    Delete
                </Button>

                {/* BASIC FIELDS */}
                {Object.entries(handicap).map(([key, value]) => {
                    if (key === "teeName") return null;
                    if (key === "bogeyRating") return null;
                    if (key.startsWith("frontNine") || key.startsWith("backNine"))
                        return null;

                    const isNumber =
                        key.startsWith("par") ||
                        key.startsWith("course") ||
                        key.startsWith("slope");

                    return (
                        <InputField
                            key={key}
                            name={`${courseName}.handicapData.${index}.${key}`}
                            label={LABELS[key] ?? key}
                            defaultValue={String(value)}
                            type={isNumber ? "number" : "text"}
                            register={form.register}
                            validation={{
                                onChange: (e: any) => {
                                    const newVal = updateBasicField(key, e.target.value);
                                    e.target.value = newVal;
                                },
                            }}
                        />
                    );
                })}

                {/* FRONT 9 */}
                <AccordionItem value={`front9-${index}`}>
                    <AccordionTrigger className="text-md font-medium">
                        Front 9
                    </AccordionTrigger>

                    <AccordionContent className="space-y-2 p-2">
                        {Object.entries(handicap)
                            .filter(([key]) => key.startsWith("frontNine") && !key.endsWith("BogeyRating"))
                            .map(([key, value]) => {
                                const isCourse = key.toLowerCase().includes("course");

                                return (
                                    <InputField
                                        key={key}
                                        name={`${courseName}.handicapData.${index}.${key}`}
                                        label={LABELS[key] ?? key}
                                        type="number"
                                        defaultValue={String(value)}
                                        register={form.register}
                                        validation={{
                                            onChange: (e: any) => {
                                                let v = e.target.value;
                                                if (!isCourse) v = round(v);

                                                updateCourse(
                                                    courseName,
                                                    `handicapData.${index}.${key}`,
                                                    v
                                                );
                                                e.target.value = v;
                                            },
                                        }}
                                    />
                                );
                            })}
                    </AccordionContent>
                </AccordionItem>

                {/* BACK 9 */}
                <AccordionItem value={`back9-${index}`}>
                    <AccordionTrigger className="text-md font-medium">
                        Back 9
                    </AccordionTrigger>

                    <AccordionContent className="space-y-2 p-2">
                        {Object.entries(handicap)
                            .filter(([key]) => key.startsWith("backNine") && !key.endsWith("BogeyRating"))
                            .map(([key, value]) => {
                                const isCourse = key.toLowerCase().includes("course");

                                return (
                                    <InputField
                                        key={key}
                                        name={`${courseName}.handicapData.${index}.${key}`}
                                        label={LABELS[key] ?? key}
                                        type="number"
                                        defaultValue={String(value)}
                                        register={form.register}
                                        validation={{
                                            onChange: (e: any) => {
                                                let v = e.target.value;
                                                if (!isCourse) v = round(v);

                                                updateCourse(
                                                    courseName,
                                                    `handicapData.${index}.${key}`,
                                                    v
                                                );
                                                e.target.value = v;
                                            },
                                        }}
                                    />
                                );
                            })}
                    </AccordionContent>
                </AccordionItem>
            </AccordionContent>
        </AccordionItem>
    );
}
