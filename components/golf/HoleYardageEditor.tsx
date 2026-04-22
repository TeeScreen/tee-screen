"use client";

import InputField from "@/components/forms/InputField";

type HoleYardageEditorProps = {
    courseName: string;
    hole: any;
    index: number;
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;

    // NEW — global tee settings
    teeSettings: {
        whiteTeeLabel: string;
        yellowTeeLabel: string;
        redTeeLabel: string;
    };
};

export default function HoleYardageEditor({
                                              courseName,
                                              hole,
                                              index,
                                              form,
                                              updateCourse,
                                              teeSettings,
                                          }: HoleYardageEditorProps) {
    const yardageKeys = [
        "yardsToHole",
        "whiteYardsToHole",
        "yellowYardsToHole",
        "redYardsToHole",
    ] as const;

    // Dynamic labels using global tee settings
    const LABELS: Record<(typeof yardageKeys)[number], string> = {
        yardsToHole: "Hole Yardage",
        whiteYardsToHole: `${teeSettings.whiteTeeLabel} Yardage`,
        yellowYardsToHole: `${teeSettings.yellowTeeLabel} Yardage`,
        redYardsToHole: `${teeSettings.redTeeLabel} Yardage`,
    };

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {yardageKeys.map((key) => {
                const value = hole[key];

                return (
                    <InputField
                        key={key}
                        name={`${courseName}.holesData.${index}.${key}`}
                        label={LABELS[key]}
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
