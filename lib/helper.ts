// lib/helper.ts
export function toUnityIsoString(date: Date): string {
    // Get UTC values
    const utcYear = date.getUTCFullYear();
    const utcMonth = date.getUTCMonth();
    const utcDay = date.getUTCDate();
    const utcHour = date.getUTCHours();
    const utcMinute = date.getUTCMinutes();
    const utcSecond = date.getUTCSeconds();
    const utcMs = date.getUTCMilliseconds();

    // Compute London offset at this instant
    const london = new Date(date.toLocaleString("en-GB", { timeZone: "Europe/London" }));
    const tzOffset = -london.getTimezoneOffset(); // minutes
    const sign = tzOffset >= 0 ? "+" : "-";
    const absOffset = Math.abs(tzOffset);
    const hhOffset = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const mmOffset = String(absOffset % 60).padStart(2, "0");

    // Use the London-local values
    const year = london.getFullYear();
    const month = String(london.getMonth() + 1).padStart(2, "0");
    const day = String(london.getDate()).padStart(2, "0");
    const hour = String(london.getHours()).padStart(2, "0");
    const minute = String(london.getMinutes()).padStart(2, "0");
    const second = String(london.getSeconds()).padStart(2, "0");
    const ms = String(london.getMilliseconds()).padStart(3, "0");

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${sign}${hhOffset}:${mmOffset}`;
}