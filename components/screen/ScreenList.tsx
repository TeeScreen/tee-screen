"use client";

import { useState } from "react";
import { ScreenItem } from "./ScreenItem";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ScreenList({
                               screens,
                               loadedScreen,
                               onLoadScreen,
                           }: {
    screens: string[];
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
}) {
    // Compact mode is now default
    const [compact, setCompact] = useState(true);

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Toggle */}
            <div className="flex items-center justify-end gap-2 pr-1">
                <Label htmlFor="compact-toggle" className="text-sm">
                    {compact ? "Compact View" : "Normal View"}
                </Label>
                <Switch
                    id="compact-toggle"
                    checked={compact}
                    onCheckedChange={setCompact}
                />
            </div>

            {/* Grid */}
            <div
                className={`grid gap-3 w-full ${
                    compact
                        ? "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
                {screens.map((screen) => (
                    <ScreenItem
                        key={screen}
                        screenName={screen}
                        loadedScreen={loadedScreen}
                        onLoadScreen={onLoadScreen}
                        compact={compact}
                    />
                ))}
            </div>
        </div>
    );
}