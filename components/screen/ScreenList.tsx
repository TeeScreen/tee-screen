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
        <div className="space-y-2 sm:space-y-3 w-full overflow-x-hidden">
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