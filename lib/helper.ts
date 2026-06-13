// lib/helper.ts
export function toUnityIsoString(date: Date): string {
    const fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = fmt.formatToParts(date);
    const get = (type: string) => {
        const val = parts.find(p => p.type === type)?.value;
        return val && /^\d+$/.test(val) ? val : "00";
    };

    // Hard‑coded milliseconds
    const ms = "000";

    // Hard‑coded offset (choose one)
    const offset = "+00:00"; // GMT
    // const offset = "+01:00"; // BST

    return (
        `${get("year")}-${get("month")}-${get("day")}T` +
        `${get("hour")}:${get("minute")}:${get("second")}.` +
        `${ms}${offset}`
    );
}