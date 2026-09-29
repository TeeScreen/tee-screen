import React, { useState } from "react";

interface ColorPickerWrapperProps {
    defaultColor?: string;
    recentColors?: string[];
    onChange?: (color: string) => void;
}

export const ColorPickerWrapper: React.FC<ColorPickerWrapperProps> = ({
                                                                          defaultColor = "#3b82f6",
                                                                          recentColors = [],
                                                                          onChange,
                                                                      }) => {
    const [color, setColor] = useState(defaultColor);
    const [open, setOpen] = useState(false);

    const updateColor = (newColor: string) => {
        setColor(newColor);
        onChange?.(newColor);
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
          transition-transform
          text-white font-bold tracking-wide
        "
                style={{ backgroundColor: color }}
            >
                {color.toUpperCase()}
            </button>

            {/* Popover */}
            {open && (
                <div
                    className="
            absolute left-0 top-[60px] z-20
            bg-popover text-popover-foreground
            border border-border rounded-lg shadow-lg
            p-4 flex flex-col gap-4
          "
                >
                    {/* Native color input */}
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => updateColor(e.target.value)}
                        className="
              w-[140px] h-[42px]
              cursor-pointer border-none bg-transparent
            "
                    />

                    {/* Current colors */}
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
                                        onClick={() => updateColor(rc)}
                                        className="
                      w-7 h-7 rounded-md border border-border
                      shadow-inner cursor-pointer transition-transform
                    "
                                        style={{
                                            backgroundColor: rc,
                                            outline:
                                                color.toLowerCase() === rc.toLowerCase()
                                                    ? "2px solid var(--color-primary)"
                                                    : "none",
                                        }}
                                        title={rc}
                                        aria-label={`Select recent color ${rc}`}
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
