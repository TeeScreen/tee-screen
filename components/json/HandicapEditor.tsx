"use client";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";

const LABELS: Record<string, string> = {
    displayedName: "Colour",
    gender: "Gender",
    par: "Par",
    courseRating: "Course Rating",
    bogeyRating: "Bogey Rating",
    slopeRating: "Slope Rating",

    frontNinePar: "Front 9 Par",
    frontNineCourseRating: "Front 9 Course Rating",
    frontNineSlopeRating: "Front 9 Slope Rating",
    frontNineBogeyRating: "Front 9 Bogey Rating",

    backNinePar: "Back 9 Par",
    backNineCourseRating: "Back 9 Course Rating",
    backNineSlopeRating: "Back 9 Slope Rating",
    backNineBogeyRating: "Back 9 Bogey Rating",
};

export default function HandicapEditor({
                                           courseName,
                                           handicapData,
                                           form,
                                           updateCourse,
                                           updateJson,
                                           localJson,
                                       }: {
    courseName: string;
    handicapData: any[];
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateJson: (json: any) => void;
    localJson: any;
}) {
    function addHandicap() {
        const updated = structuredClone(localJson);
        updated.golfCoursesData[courseName].handicapData.push({
            teeName: "",
            displayedName: "",
            gender: "",
            par: 0,
            courseRating: 0,
            bogeyRating: 0,
            slopeRating: 0,

            frontNinePar: 0,
            frontNineCourseRating: 0,
            frontNineSlopeRating: 0,
            frontNineBogeyRating: 0,

            backNinePar: 0,
            backNineCourseRating: 0,
            backNineSlopeRating: 0,
            backNineBogeyRating: 0,
        });
        updateJson(updated);
    }

    function deleteHandicap(index: number) {
        const updated = structuredClone(localJson);
        updated.golfCoursesData[courseName].handicapData.splice(index, 1);
        updateJson(updated);
    }

    return (
        <Accordion type="multiple" className="border rounded p-2">
            <AccordionItem value="handicaps">
                <AccordionTrigger className="text-lg font-medium">
                    Handicap Data
                </AccordionTrigger>

                <AccordionContent className="space-y-4">
                    <Button type="button" onClick={addHandicap}>
                        Add Handicap
                    </Button>

                    <Accordion type="multiple" className="border rounded p-2">
                        {handicapData.map((handicap: any, index: number) => {
                            const title =
                                handicap.displayedName && handicap.gender
                                    ? `${handicap.displayedName} - ${handicap.gender}`
                                    : `Handicap ${index + 1}`;

                            return (
                                <AccordionItem key={index} value={`handicap-${index}`}>
                                    <AccordionTrigger>{title}</AccordionTrigger>

                                    <AccordionContent className="space-y-4 p-2">
                                        <Button
                                            variant="destructive"
                                            type="button"
                                            onClick={() => deleteHandicap(index)}
                                        >
                                            Delete
                                        </Button>

                                        {/* BASIC FIELDS (excluding teeName) */}
                                        {Object.entries(handicap).map(([key, value]) => {
                                            if (key === "teeName") return null;
                                            if (key.startsWith("frontNine") || key.startsWith("backNine"))
                                                return null;

                                            return (
                                                <InputField
                                                    key={key}
                                                    name={`${courseName}.handicapData.${index}.${key}`}
                                                    label={LABELS[key] ?? key}
                                                    defaultValue={String(value)}
                                                    register={form.register}
                                                    validation={{
                                                        onChange: (e: any) => {
                                                            const newVal = e.target.value;

                                                            updateCourse(
                                                                courseName,
                                                                `handicapData.${index}.${key}`,
                                                                newVal
                                                            );

                                                            // Auto-update teeName = displayedName-gender
                                                            if (key === "displayedName" || key === "gender") {
                                                                const updatedName = `${handicap.displayedName || ""}-${handicap.gender || ""}`;
                                                                updateCourse(
                                                                    courseName,
                                                                    `handicapData.${index}.teeName`,
                                                                    updatedName
                                                                );
                                                            }
                                                        },
                                                    }}
                                                />
                                            );
                                        })}

                                        {/* FRONT 9 */}
                                        <Accordion type="multiple" className="border rounded p-2">
                                            <AccordionItem value={`front9-${index}`}>
                                                <AccordionTrigger className="text-md font-medium">
                                                    Front 9
                                                </AccordionTrigger>

                                                <AccordionContent className="space-y-2 p-2">
                                                    {Object.entries(handicap)
                                                        .filter(([key]) => key.startsWith("frontNine"))
                                                        .map(([key, value]) => (
                                                            <InputField
                                                                key={key}
                                                                name={`${courseName}.handicapData.${index}.${key}`}
                                                                label={LABELS[key] ?? key}
                                                                defaultValue={String(value)}
                                                                register={form.register}
                                                                validation={{
                                                                    onChange: (e: any) =>
                                                                        updateCourse(
                                                                            courseName,
                                                                            `handicapData.${index}.${key}`,
                                                                            e.target.value
                                                                        ),
                                                                }}
                                                            />
                                                        ))}
                                                </AccordionContent>
                                            </AccordionItem>

                                            {/* BACK 9 */}
                                            <AccordionItem value={`back9-${index}`}>
                                                <AccordionTrigger className="text-md font-medium">
                                                    Back 9
                                                </AccordionTrigger>

                                                <AccordionContent className="space-y-2 p-2">
                                                    {Object.entries(handicap)
                                                        .filter(([key]) => key.startsWith("backNine"))
                                                        .map(([key, value]) => (
                                                            <InputField
                                                                key={key}
                                                                name={`${courseName}.handicapData.${index}.${key}`}
                                                                label={LABELS[key] ?? key}
                                                                defaultValue={String(value)}
                                                                register={form.register}
                                                                validation={{
                                                                    onChange: (e: any) =>
                                                                        updateCourse(
                                                                            courseName,
                                                                            `handicapData.${index}.${key}`,
                                                                            e.target.value
                                                                        ),
                                                                }}
                                                            />
                                                        ))}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}