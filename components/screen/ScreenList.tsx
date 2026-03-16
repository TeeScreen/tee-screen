"use client";

import { ScreenItem } from "./ScreenItem";

export function ScreenList({
                               screens,
                               loadedScreen,
                               onLoadScreen,
                           }: {
    screens: string[];
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {screens.map((screen) => (
                <ScreenItem
                    key={screen}
                    screenName={screen}
                    loadedScreen={loadedScreen}
                    onLoadScreen={onLoadScreen}
                />
            ))}
        </div>
    );
}