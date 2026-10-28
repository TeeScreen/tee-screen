import React, { useState } from "react";

interface ColorPickerWrapperProps {
    defaultColor?: string;      // hex
    recentColors?: string[];
    defaultAlpha?: number;      // 0–1
    onChange?: (value: { hex: string; alpha: number }) => void;
}

export const ColorPickerWrapper: React.FC<ColorPickerWrapperProps> = ({
                                                                          defaultColor = "#3b82f6",
                                                                          recentColors = [],
                                                                          defaultAlpha = 1,
                                                                          onChange,
                                                                      }) => {
    const [hex, setHex] = useState(defaultColor);

    if(defaultAlpha == 1) defaultAlpha = 255;

    const [alpha, setAlpha] = useState(defaultAlpha);
    const [open, setOpen] = useState(false);

    const emit = (h: string, a: number) => {
        onChange?.({ hex: h, alpha: a });
    };

    return (
        <div className="relative flex flex-col gap-3">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="
                    flex items-center justify-center
                    w-[140px] h-[42px]
                    rounded-lg border border-border shadow-sm
                    text-white font-bold tracking-wide
                "
                style={{
                    backgroundColor: `rgba(${hexToRgb(hex)}, ${alpha})`,
                }}
            >
                {hex.toUpperCase()}
            </button>

            {open && (
                <div
                    className="
                        absolute left-0 top-[60px] z-20
                        bg-popover text-popover-foreground
                        border border-border rounded-lg shadow-lg
                        p-4 flex flex-col gap-4
                    "
                >
                    {/* Color input */}
                    <input
                        type="color"
                        value={hex}
                        onChange={(e) => {
                            const newHex = e.target.value;
                            setHex(newHex);
                            emit(newHex, alpha);
                        }}
                        className="w-[140px] h-[42px] cursor-pointer bg-transparent border-none"
                    />

                    {/* Alpha slider */}
                    <div className="flex flex-col gap-2">
    <span className="text-xs font-semibold text-muted-foreground">
        Transparency: {100-Math.round((alpha/255)*100)} %
    </span>

                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={Math.round(((255-alpha) / 255) * 100)}   // UI shows 0–100
                            onChange={(e) => {
                                const percent = Number(e.target.value);      // 0–100
                                const newAlpha = Math.round(((100-percent) / 100) * 255); // convert to 0–255
                                setAlpha(newAlpha);
                                emit(hex, newAlpha);
                            }}
                            className="w-full cursor-pointer accent-[var(--color-primary)]"
                        />
                    </div>


                    {/* Recent colors */}
                    {recentColors.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-semibold text-muted-foreground">
                                Current Colors:
                            </span>

                            <div className="flex flex-wrap gap-2">
                                {recentColors.map((rc, index) => (
                                    <button
                                        key={`${rc}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            setHex(rc);
                                            emit(rc, alpha);
                                        }}
                                        className="
                                            w-7 h-7 rounded-md border border-border
                                            shadow-inner cursor-pointer
                                        "
                                        style={{
                                            backgroundColor: rc,
                                            outline:
                                                hex.toLowerCase() === rc.toLowerCase()
                                                    ? "2px solid var(--color-primary)"
                                                    : "none",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/* Helpers */
function hexToRgb(hex: string): string {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}
