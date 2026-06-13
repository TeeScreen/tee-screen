// lib/helper.ts
export function toUnityIsoString(date: Date): string {
    // Create a London-local date using Intl
    const londonFmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = londonFmt.formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? "00";

    // Build a London-local Date object for offset calculation
    const londonDate = new Date(date.toLocaleString("en-GB", { timeZone: "Europe/London" }));
    const tzOffset = -londonDate.getTimezoneOffset(); // minutes
    const sign = tzOffset >= 0 ? "+" : "-";
    const absOffset = Math.abs(tzOffset);
    const hhOffset = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const mmOffset = String(absOffset % 60).padStart(2, "0");

    // Milliseconds from original date, padded
    const ms = String(londonDate.getMilliseconds()).padStart(3, "0");

    return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}.${ms}${sign}${hhOffset}:${mmOffset}`;
}