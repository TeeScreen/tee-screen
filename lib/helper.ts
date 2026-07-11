export function toUnityIsoString(hourOffset: number = 0): string {
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

    // Adjust the hour ONLY
    const rawHour = Number(get("hour"));
    const adjustedHour = ((rawHour + hourOffset) % 24 + 24) % 24; // safe wraparound
    const hour = String(adjustedHour).padStart(2, "0");

    const minute = get("minute");
    const second = get("second");
    const ms = String(now.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;
}
