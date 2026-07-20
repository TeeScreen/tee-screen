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

/* -------------------------------------------------------
   Compute teeName reactively (Colour-Gender)
------------------------------------------------------- */
function computeTeeName(handicap: any) {
    const colour = handicap.displayedName?.trim() || "";
    const gender = handicap.gender?.trim() || "";

    const name = `${colour}-${gender}`;
    return name.replace(/^-|-$/g, "");
}

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
    /* -------------------------------------------------------
       Add new handicap entry
    ------------------------------------------------------- */
    function addHandicap() {
        const updated = structuredClone(localJson);
        updated.golfCoursesData[courseName].handicapData.push({
            teeName: "Green-Male",
            displayedName: "Green",
            gender: "Male",
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

    /* -------------------------------------------------------
       Delete handicap entry
    ------------------------------------------------------- */
    function deleteHandicap(index: number) {
        const updated = structuredClone(localJson);
        updated.golfCoursesData[courseName].handicapData.splice(index, 1);
        updateJson(updated);
    }

    /* -------------------------------------------------------
       Render
    ------------------------------------------------------- */
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
                            const title = handicap.teeName?.trim()
                                ? handicap.teeName
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

                                        {/* BASIC FIELDS */}
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

                                                            // Work directly off localJson so we control the full mutation
                                                            const updated = structuredClone(localJson);
                                                            const course = updated.golfCoursesData[courseName];
                                                            const handicap = course.handicapData[index];

                                                            // 1. Update the field itself
                                                            (handicap as any)[key] = newVal;

                                                            // 2. If colour or gender changed, recompute teeName from the SAME updated object
                                                            if (key === "displayedName" || key === "gender") {
                                                                const colour =
                                                                    key === "displayedName" ? newVal : handicap.displayedName || "";
                                                                const gender =
                                                                    key === "gender" ? newVal : handicap.gender || "";

                                                                const newTeeName = `${colour}-${gender}`.replace(/^-|-$/g, "");

                                                                handicap.teeName = newTeeName;
                                                            }

                                                            // 3. Push the fully updated JSON back up
                                                            updated.golfCoursesData[courseName] = course;
                                                            updateJson(updated);
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
