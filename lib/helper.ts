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
        return val && !isNaN(Number(val)) ? val : "00";
    };

    // London-local date for offset + milliseconds
    const londonDate = new Date(date.toLocaleString("en-GB", { timeZone: "Europe/London" }));
    const tzOffset = -londonDate.getTimezoneOffset();
    const sign = tzOffset >= 0 ? "+" : "-";
    const absOffset = Math.abs(tzOffset);
    const hhOffset = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const mmOffset = String(absOffset % 60).padStart(2, "0");

    const ms = String(londonDate.getMilliseconds()).padStart(3, "0");

    return (
        `${get("year")}-${get("month")}-${get("day")}T` +
        `${get("hour")}:${get("minute")}:${get("second")}.` +
        `${ms}${sign}${hhOffset}:${mmOffset}`
    );
}