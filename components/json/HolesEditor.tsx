"use client";

import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";

export default function HolesEditor({
                                        courseName,
                                        holesData,
                                        form,
                                        updateCourse,
                                    }: {
    courseName: string;
    holesData: any[];
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
}) {
    return (
        <Accordion type="multiple" className="border rounded p-2">
            <AccordionItem value="holes">
                <AccordionTrigger className="text-lg font-medium">
                    Holes Data
                </AccordionTrigger>

                <AccordionContent className="space-y-4">
                    <Accordion type="multiple" className="border rounded p-2">
                        {holesData.map((hole: any, i: number) => (
                            <AccordionItem key={i} value={`hole-${i}`}>
                                <AccordionTrigger>Hole {hole.holeNumber}</AccordionTrigger>

                                <AccordionContent className="grid gap-4 p-2">
                                    {Object.entries(hole).map(([key, value]) => {
                                        if (key === "holeImageURL") return null;

                                        // Lat/Long objects
                                        if (
                                            value &&
                                            typeof value === "object" &&
                                            "x" in value &&
                                            "y" in value
                                        ) {
                                            const coords = value as { x: number; y: number };

                                            return (
                                                <div key={key} className="grid grid-cols-2 gap-2">
                                                    <label className="font-medium">{key}</label>

                                                    <div className="flex gap-2">
                                                        <InputField
                                                            name={`${courseName}.holesData.${i}.${key}.x`}
                                                            label="x"
                                                            defaultValue={coords.x}
                                                            register={form.register}
                                                            validation={{
                                                                onChange: (e: any) =>
                                                                    updateCourse(
                                                                        courseName,
                                                                        `holesData.${i}.${key}.x`,
                                                                        Number(e.target.value)
                                                                    ),
                                                            }}
                                                        />

                                                        <InputField
                                                            name={`${courseName}.holesData.${i}.${key}.y`}
                                                            label="y"
                                                            defaultValue={coords.y}
                                                            register={form.register}
                                                            validation={{
                                                                onChange: (e: any) =>
                                                                    updateCourse(
                                                                        courseName,
                                                                        `holesData.${i}.${key}.y`,
                                                                        Number(e.target.value)
                                                                    ),
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // PAR → SelectField
                                        if (key === "parNumber") {
                                            return (
                                                <SelectField
                                                    key={key}
                                                    name={`${courseName}.holesData.${i}.${key}`}
                                                    label="Par"
                                                    placeholder="Select Par"
                                                    options={[
                                                        { label: "3", value: "3" },
                                                        { label: "4", value: "4" },
                                                        { label: "5", value: "5" },
                                                    ]}
                                                    control={form.control}
                                                    error={null}
                                                    required={false}
                                                    onChange={(val: string) =>
                                                        updateCourse(
                                                            courseName,
                                                            `holesData.${i}.${key}`,
                                                            val
                                                        )
                                                    }
                                                />
                                            );
                                        }

                                        // SI → SelectField
                                        if (key === "siNumber") {
                                            return (
                                                <SelectField
                                                    key={key}
                                                    name={`${courseName}.holesData.${i}.${key}`}
                                                    label="Stroke Index"
                                                    placeholder="Select SI"
                                                    options={Array.from({ length: 18 }).map((_, idx) => ({
                                                        label: `${idx + 1}`,
                                                        value: `${idx + 1}`,
                                                    }))}
                                                    control={form.control}
                                                    error={null}
                                                    required={false}
                                                    onChange={(val: string) =>
                                                        updateCourse(
                                                            courseName,
                                                            `holesData.${i}.${key}`,
                                                            val
                                                        )
                                                    }
                                                />
                                            );
                                        }

                                        // Default → InputField
                                        return (
                                            <InputField
                                                key={key}
                                                name={`${courseName}.holesData.${i}.${key}`}
                                                label={key}
                                                defaultValue={value as string | number | boolean | null | undefined}
                                                register={form.register}
                                                validation={{
                                                    onChange: (e: any) =>
                                                        updateCourse(
                                                            courseName,
                                                            `holesData.${i}.${key}`,
                                                            e.target.value
                                                        ),
                                                }}
                                            />
                                        );
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}