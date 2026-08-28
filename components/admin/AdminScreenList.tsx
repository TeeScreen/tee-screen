"use client";

import { AdminScreenItem } from "@/components/admin/AdminScreenItem";

type Screen = {
    screenName: string;
    lastLive: string;
    FolderName: string;
};

export function AdminScreenList({ screens }: { screens: Record<string, Screen> }) {
    const parseLastLive = (s: string) => {
        const [date, time] = s.split(" ");
        const [y, m, d] = date.split("-").map(Number);
        const [hh, mm, ss] = time.split(":").map(Number);
        return new Date(y, m - 1, d, hh, mm, ss).getTime();
    };

    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const twoDays = 2 * 24 * 60 * 60 * 1000;

    // 4 AM today
    const todayDate = new Date();
    todayDate.setHours(4, 0, 0, 0);
    const fourAM = todayDate.getTime();
    const diffFrom4AM = now - fourAM;

    const screenList: Screen[] = Object.values(screens).sort((a, b) => {
        const aTime = parseLastLive(a.lastLive);
        const bTime = parseLastLive(b.lastLive);
        return bTime - aTime;
    });

    const live: Screen[] = [];
    const today: Screen[] = [];
    const warning: Screen[] = [];
    const offline: Screen[] = [];

    for (const screen of screenList) {
        const t = parseLastLive(screen.lastLive);
        const diff = now - t;

        if (diff <= tenMinutes) {
            live.push(screen);
        } else if (diff <= diffFrom4AM) {
            today.push(screen);
        } else if (diff <= twoDays) {
            warning.push(screen);
        } else {
            offline.push(screen);
        }
    }

    const Section = ({
                         title,
                         items,
                         colour,
                     }: {
        title: string;
        items: Screen[];
        colour: string;
    }) => (
        <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">{title}</h2>

            <div
                className={`
                    grid
                    gap-4
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    xl:grid-cols-6
                    ${colour}
                    p-2
                `}
            >
                {items.map((screen) => (
                    <AdminScreenItem key={screen.screenName} screen={screen} />
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col gap-12">
            <Section title="🟢 Live" items={live} colour="bg-green-200" />
            <Section title="🟡 Active Today" items={today} colour="bg-yellow-200" />
            <Section title="🟠 Active Within Last 2 Days" items={warning} colour="bg-orange-300" />
            <Section title="🔴 Offline" items={offline} colour="bg-red-200" />
        </div>
    );
}
