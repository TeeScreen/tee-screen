import {useCallback, useState} from "react";
import {HexColorPicker} from "react-colorful";

export interface RGBA {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface ColorInputWithPresetsProps {
    json: any;
    label: string;
    value: RGBA;
    onChange: (rgba: RGBA) => void;
    presets?: RGBA[];
}

const rgbaToHex = (rgba: RGBA) =>
    `#${rgba.r.toString(16).padStart(2, "0")}${rgba.g
        .toString(16)
        .padStart(2, "0")}${rgba.b.toString(16).padStart(2, "0")}`;

const hexToRgba = (hex: string, alpha: number): RGBA => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: alpha };
};

export function ColorInput({
    json,
    label,
    value,
    onChange,
    presets = [],
}: ColorInputWithPresetsProps) {
    const rgba = value || { r: 0, g: 0, b: 0, a: 1 };

    const handleHexChange = useCallback(
        (hex: string) => {
            const updated = hexToRgba(hex, rgba.a);
            onChange(updated);
        },
        [rgba, onChange]
    );

    const handlePresetClick = useCallback(
        (preset: RGBA) => {
            onChange(preset);
        },
        [onChange]
    );

    if(presets?.length ==0)
    {
        presets = [json.TopNoticeBoardColour, json.MiddleNoticeBoardColour, json.BottomNoticeBoardColour];
    }

    const [open, setOpen] = useState(false);

    const currentHex = rgbaToHex(value);

    return (
        <div className="relative inline-block">
            {/* Trigger */}
            <button
                type="button"
                className="h-10 w-20 rounded border"
                style={{ backgroundColor: currentHex }}
                onClick={() => setOpen(!open)}
            />

            {/* Popover */}
            {open && (
                <div className="absolute z-50 mt-2 p-4 rounded border bg-white shadow-lg">
                    {/* Main Color Picker */}
                    <input
                        type="color"
                        value={rgbaToHex(rgba)}
                        onChange={(e) => handleHexChange(e.target.value)}
                        className="h-10 w-20 rounded border cursor-pointer"
                    />

                    {/* Presets */}
                    {presets.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {presets.map((preset, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onChange(preset)}
                                    className="h-8 w-8 rounded border"
                                    style={{
                                        backgroundColor: rgbaToHex(preset),
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
