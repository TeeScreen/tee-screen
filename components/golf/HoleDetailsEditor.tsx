"use client";

import SelectField from "@/components/forms/SelectField";

type HoleDetailsEditorProps = {
    courseName: string;
    hole: any;
    index: number;
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
};

export default function HoleDetailsEditor({
                                              courseName,
                                              hole,
                                              index,
                                              form,
                                              updateCourse,
                                          }: HoleDetailsEditorProps) {
    const parValue = hole.parNumber ?? "4";
    const siValue = hole.siNumber ?? "1";

    return (
        <div className="grid gap-3 md:grid-cols-2">
            <SelectField
                name={`${courseName}.holesData.${index}.parNumber`}
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
                    updateCourse(courseName, `holesData.${index}.parNumber`, val)
                }
                defaultValue={parValue}
            />

            <SelectField
                name={`${courseName}.holesData.${index}.siNumber`}
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
                    updateCourse(courseName, `holesData.${index}.siNumber`, val)
                }
                defaultValue={siValue}
            />
        </div>
    );
}