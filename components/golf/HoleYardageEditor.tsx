"use client";

import InputField from "@/components/forms/InputField";

type HoleYardageEditorProps = {
    courseName: string;
    hole: any;
    index: number;
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
};

export default function HoleYardageEditor({
                                              courseName,
                                              hole,
                                              index,
                                              form,
                                              updateCourse,
                                          }: HoleYardageEditorProps) {
    const yardageKeys = [
        "yardsToHole",
        "whiteYardsToHole",
        "yellowYardsToHole",
        "redYardsToHole",
    ];

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {yardageKeys.map((key) => {
                const value = hole[key];

                return (
                    <InputField
                        key={key}
                        name={`${courseName}.holesData.${index}.${key}`}
                        label={key}
                        type="number"
                        defaultValue={value}
                        register={form.register}
                        validation={{
                            valueAsNumber: true,
                            min: {
                                value: 0,
                                message: "Must be greater than or equal to 0",
                            },
                            onChange: (e: any) =>
                                updateCourse(
                                    courseName,
                                    `holesData.${index}.${key}`,
                                    Number(e.target.value)
                                ),
                        }}
                    />
                );
            })}
        </div>
    );
}