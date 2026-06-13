// lib/helper.ts
export function toUnityIsoString(): string {
    // Get "now" in UTC
    const now = new Date();

    // Format parts in London time
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

    const parts = fmt.formatToParts(now);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? "00";

    const year = get("year");
    const month = get("month");
    const day = get("day");
    const hour = get("hour");
    const minute = get("minute");
    const second = get("second");
    const ms = String(now.getMilliseconds()).padStart(3, "0");

    // Compute offset for London at this instant
    const londonDate = new Date(now.toLocaleString("en-GB", { timeZone: "Europe/London" }));
    const tzOffset = -londonDate.getTimezoneOffset(); // minutes east of UTC
    const sign = tzOffset >= 0 ? "+" : "-";
    const absOffset = Math.abs(tzOffset);
    const hhOffset = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const mmOffset = String(absOffset % 60).padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;
}
