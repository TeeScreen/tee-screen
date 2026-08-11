"use client";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import {round} from "@floating-ui/utils";

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
            teeName: "Colour-Gender",
            displayedName: "Colour",
            gender: "Gender",
            par: 0,
            courseRating: 0,
            slopeRating: 0,

            frontNinePar: 0,
            frontNineCourseRating: 0,
            frontNineSlopeRating: 0,

            backNinePar: 0,
            backNineCourseRating: 0,
            backNineSlopeRating: 0,
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
                                            if (
                                                key === "bogeyRating"
                                            ) {
                                                return null;
                                            }
                                            if (key.startsWith("frontNine") || key.startsWith("backNine"))
                                                return null;

                                            const isNumber = key.startsWith("par") || key.startsWith("course") || key.startsWith("slope");
                                            return (
                                                <InputField
                                                    key={key}
                                                    name={`${courseName}.handicapData.${index}.${key}`}
                                                    label={LABELS[key] ?? key}
                                                    defaultValue={String(value)}
                                                    type = {isNumber ? "number" : "text"}
                                                    register={form.register}
                                                    validation={{
                                                        onChange: (e: any) => {
                                                            let newVal = e.target.value;

                                                            if (isNumber && !key.startsWith("course")) {
                                                                newVal = round(newVal);
                                                            }

                                                            // If blank, revert to 0
                                                            if (newVal === "" || newVal === null || newVal === undefined){
                                                                if(isNumber) {
                                                                    newVal = 0;
                                                                }
                                                                else {
                                                                    newVal = ""
                                                                }
                                                            }

                                                            const updated = structuredClone(localJson);
                                                            const course = updated.golfCoursesData[courseName];
                                                            const handicap = course.handicapData[index];

                                                            // 1. Update field
                                                            handicap[key] = newVal;

                                                            // 2. Recompute teeName if colour/gender changed
                                                            if (key === "displayedName" || key === "gender") {
                                                                const colour = key === "displayedName" ? newVal : handicap.displayedName || "";
                                                                const gender = key === "gender" ? newVal : handicap.gender || "";

                                                                const newTeeName = `${colour}-${gender}`.replace(/^-|-$/g, "");
                                                                handicap.teeName = newTeeName;
                                                            }

                                                            // 3. Push updated JSON
                                                            updated.golfCoursesData[courseName] = course;
                                                            updateJson(updated);
                                                            e.target.value = newVal;
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
                                                                            let value = e.target.value;

                                                                            if (!isCourse) {
                                                                                value = round(value);
                                                                            }

                                                                            updateCourse(
                                                                                courseName,
                                                                                `handicapData.${index}.${key}`,
                                                                                value
                                                                            );
                                                                            e.target.value = value;
                                                                        }}}
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
                                                                            let value = e.target.value;

                                                                            if (!isCourse) {
                                                                                value = round(value);
                                                                            }

                                                                            updateCourse(
                                                                                courseName,
                                                                                `handicapData.${index}.${key}`,
                                                                                value
                                                                            );
                                                                            e.target.value = value;
                                                                    }}}
                                                                />
                                                            );
                                                        })}
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
