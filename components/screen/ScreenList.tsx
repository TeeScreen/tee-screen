"use client";

import { ScreenData } from "@/database/models/user.model";
import { ScreenItem } from "./ScreenItem";

export function ScreenList({
                               screens,
                               loadedScreen,
                               onLoad,
                               onDelete,
                           }: {
    screens: ScreenData[];
    loadedScreen: string | null;
    onLoad: (login: string) => void;
    onDelete: (login: string) => void;
}) {
    if (screens.length === 0) {
        return <p>No screens added yet.</p>;
    }

    return (
        <div className="space-y-4">
            {screens.map((screen) => (
                <ScreenItem
                    key={screen.screenLogin}
                    screen={screen}
                    isLoaded={loadedScreen === screen.screenLogin}
                    onLoad={onLoad}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}