"use client";

import { useRef, useState, useEffect } from "react";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import { useDirtyState } from "@/stores/user-store";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { FONT_OPTIONS, EFont } from "@/data/font";

function getValue(obj: any, path: string) {
    return path.split(".").reduce((acc, key) => {
        const match = key.match(/(\w+)\[(\d+)\]/);
        if (match) {
            const [, arrKey, index] = match;
            return acc?.[arrKey]?.[Number(index)];
        }
        return acc?.[key];
    }, obj);
}

function setValue(obj: any, path: string, value: any) {
    const keys = path.split(".");
    const newObj = structuredClone(obj);
    let current = newObj;

    keys.forEach((key, idx) => {
        const match = key.match(/(\w+)\[(\d+)\]/);

        if (match) {
            const [, arrKey, index] = match;
            if (idx === keys.length - 1) {
                current[arrKey][Number(index)] = value;
            } else {
                current = current[arrKey][Number(index)];
            }
        } else {
            if (idx === keys.length - 1) {
                current[key] = value;
            } else {
                current = current[key];
            }
        }
    });

    return newObj;
}

export function JsonFieldEditor({
                                    json,
                                    paths,
                                    action,
                                }: {
    json: any;
    paths: {
        path: string;
        label: string;
        type: "text" | "color" | "bool" | "number" | "font";
        tag: string;
        placeholder?: string;
        options?: { label: string; value: string }[];
    }[];
    action: (formData: FormData) => void;
}) {
    const [localJson, setLocalJson] = useState(json);
    const hiddenInputRef = useRef<HTMLInputElement>(null);
    const { setDirty } = useDirtyState();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm({
        defaultValues: {
            ...localJson,
            font: String(localJson.font ?? EFont.Anton), // <-- correct place
        },
    });

    /* -------------------------------------------------------
       Sync when server sends new JSON
    ------------------------------------------------------- */
    useEffect(() => {
        setLocalJson(json);
        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = JSON.stringify(json);
        }
    }, [json]);

    /* -------------------------------------------------------
       Debounced auto-save
    ------------------------------------------------------- */
    const saveTimer = useRef<NodeJS.Timeout | null>(null);

    const autoSave = (updatedJson: any) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);

        saveTimer.current = setTimeout(async () => {
            setIsSaving(true);

            const formData = new FormData();
            formData.append("json", JSON.stringify(updatedJson));

            await action(formData);

            setIsSaving(false);
            setDirty(true);
        }, 1000);
    };

    /* -------------------------------------------------------
       Handle field change
    ------------------------------------------------------- */
    function handleChange(path: string, value: any) {
        const updated = setValue(localJson, path, value);
        setLocalJson(updated);

        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = JSON.stringify(updated);
        }

        autoSave(updated);
    }

    /* -------------------------------------------------------
       Auto-create missing paths on render
    ------------------------------------------------------- */
    function ensurePath(field: any) {
        const currentValue = getValue(localJson, field.path);

        if (currentValue !== undefined) return currentValue;

        let defaultValue;

        switch (field.type) {
            case "text":
                defaultValue = "";
                break;
            case "bool":
                defaultValue = false;
                break;
            case "color":
                defaultValue = { r: 0, g: 0, b: 0, a: 1 };
                break;
            case "number":
                defaultValue = field.options?.[0]?.value ?? 0;
                break;
            case "font":
                defaultValue = EFont.SFProDisplay; // numeric 7
                break;
            default:
                defaultValue = null;
        }

        const updated = setValue(localJson, field.path, defaultValue);
        setLocalJson(updated);

        if (hiddenInputRef.current) {
            hiddenInputRef.current.value = JSON.stringify(updated);
        }

        autoSave(updated);

        return defaultValue;
    }

    /* -------------------------------------------------------
       Group fields by tag
    ------------------------------------------------------- */
    const groups = paths.reduce((acc: any, field) => {
        if (!acc[field.tag]) acc[field.tag] = [];
        acc[field.tag].push(field);
        return acc;
    }, {});

    /* -------------------------------------------------------
       Render
    ------------------------------------------------------- */
    return (
        <div className="space-y-6">
            {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                </div>
            )}

            {Object.entries(groups).map(([tag, fields]) => (
                <div key={tag} className="space-y-4 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold capitalize">{tag}</h3>

                    <div className="grid gap-6">
                        {(fields as any[]).map((field: any) => {
                            const currentValue = ensurePath(field);

                            /* ------------------ BOOL ------------------ */
                            if (field.type === "bool") {
                                return (
                                    <div key={field.path} className="flex items-center gap-3">
                                        <label className="font-medium">{field.label}</label>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(currentValue)}
                                            onChange={(e) => handleChange(field.path, e.target.checked)}
                                            className="h-5 w-5 accent-primary"
                                        />
                                    </div>
                                );
                            }

                            /* ------------------ COLOR ------------------ */
                            if (field.type === "color") {
                                const rgba = currentValue || { r: 0, g: 0, b: 0, a: 1 };

                                const toHex = (c: any) =>
                                    `#${c.r.toString(16).padStart(2, "0")}${c.g
                                        .toString(16)
                                        .padStart(2, "0")}${c.b.toString(16).padStart(2, "0")}`;

                                const hexToRgba = (hex: string, alpha: number) => {
                                    const r = parseInt(hex.slice(1, 3), 16);
                                    const g = parseInt(hex.slice(3, 5), 16);
                                    const b = parseInt(hex.slice(5, 7), 16);
                                    return { r, g, b, a: alpha };
                                };

                                return (
                                    <div key={field.path} className="flex flex-col gap-2">
                                        <label className="font-medium">{field.label}</label>
                                        <input
                                            type="color"
                                            value={toHex(rgba)}
                                            onChange={(e) => {
                                                const updated = hexToRgba(e.target.value, rgba.a);
                                                handleChange(field.path, updated);
                                            }}
                                            className="h-10 w-20 rounded border"
                                        />
                                    </div>
                                );
                            }

                            /* ------------------ NUMBER (Select) ------------------ */
                            if (field.type === "number") {
                                return (
                                    <SelectField
                                        key={field.path}
                                        name={field.path}
                                        label={field.label}
                                        placeholder={field.placeholder}
                                        options={field.options || []}
                                        control={form.control}
                                        error={null}
                                        required={false}
                                    />
                                );
                            }

                            /* ------------------ FONT ------------------ */
                            if (field.type === "font") {
                                return (
                                    <SelectField
                                        key={field.path}
                                        name={field.path}
                                        label={field.label}
                                        placeholder="Select font"
                                        options={FONT_OPTIONS}
                                        control={form.control}
                                        error={null}
                                        required={false}
                                        defaultValue={String(currentValue)}
                                        onChange={(val) => handleChange(field.path, Number(val))} // <-- convert back
                                    />
                                );
                            }



                            /* ------------------ TEXT ------------------ */
                            return (
                                <InputField
                                    key={field.path}
                                    name={field.path}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    value={currentValue}
                                    register={() => ({
                                        onChange: (e: any) => handleChange(field.path, e.target.value),
                                    })}
                                    error={null}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}

            <input
                ref={hiddenInputRef}
                type="hidden"
                name="json"
                defaultValue={JSON.stringify(localJson)}
            />
        </div>
    );
}