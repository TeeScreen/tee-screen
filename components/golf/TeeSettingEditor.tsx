"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RGBA = { r: number; g: number; b: number; a: number };

interface TeeSettingsEditorProps {
    localJson: any;
    updateJson: (newJson: any) => void;
}

export function TeeSettingsEditor({ localJson, updateJson }: TeeSettingsEditorProps) {
    const {
        whiteTeeLabel,
        yellowTeeLabel,
        redTeeLabel,
        TeeColourWhite,
        TeeColourYellow,
        TeeColourRed,
    } = localJson;

    const rgbaToHex = (rgba: RGBA) =>
        `#${[rgba.r, rgba.g, rgba.b]
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("")}`;

    const hexToRgba = (hex: string): RGBA => {
        const clean = hex.replace("#", "");
        return {
            r: parseInt(clean.substring(0, 2), 16),
            g: parseInt(clean.substring(2, 4), 16),
            b: parseInt(clean.substring(4, 6), 16),
            a: 255,
        };
    };

    function updateField(key: string, value: any) {
        const newJson = {
            ...localJson,
            [key]: value,
        };
        updateJson(newJson);
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="tee-settings">
                <AccordionTrigger className="text-lg font-semibold">
                    Club Tee Labels & Colours
                </AccordionTrigger>

                <AccordionContent>
                    <div className="rounded-lg border p-4 space-y-6 bg-neutral-900/40">

                        {/* Back */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <Label className="pb-2">Back Tee Label</Label>
                                <Input
                                    value={whiteTeeLabel}
                                    onChange={(e) => updateField("whiteTeeLabel", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="pb-2">Back Tee Colour</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={rgbaToHex(TeeColourWhite)}
                                        onChange={(e) =>
                                            updateField("TeeColourWhite", hexToRgba(e.target.value))
                                        }
                                        className="h-10 w-14 rounded cursor-pointer border"
                                    />
                                    <span className="text-sm opacity-70">
                                        {rgbaToHex(TeeColourWhite)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Middle */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <Label className="pb-2">Middle Tee Label</Label>
                                <Input
                                    value={yellowTeeLabel}
                                    onChange={(e) => updateField("yellowTeeLabel", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="pb-2">Middle Tee Colour</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={rgbaToHex(TeeColourYellow)}
                                        onChange={(e) =>
                                            updateField("TeeColourYellow", hexToRgba(e.target.value))
                                        }
                                        className="h-10 w-14 rounded cursor-pointer border"
                                    />
                                    <span className="text-sm opacity-70">
                                        {rgbaToHex(TeeColourYellow)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Front */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <Label className="pb-2">Front Tee Label</Label>
                                <Input
                                    value={redTeeLabel}
                                    onChange={(e) => updateField("redTeeLabel", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label className="pb-2">Front Tee Colour</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={rgbaToHex(TeeColourRed)}
                                        onChange={(e) =>
                                            updateField("TeeColourRed", hexToRgba(e.target.value))
                                        }
                                        className="h-10 w-14 rounded cursor-pointer border"
                                    />
                                    <span className="text-sm opacity-70">
                                        {rgbaToHex(TeeColourRed)}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
