export function toUnityIsoString(date: Date): string {
    // Force UK timezone (BST/GMT depending on DST)
    const ukDate = new Date(date.toLocaleString("en-GB", { timeZone: "Europe/London" }));

    const tzOffset = -ukDate.getTimezoneOffset(); // minutes
    const sign = tzOffset >= 0 ? "+" : "-";
    const absOffset = Math.abs(tzOffset);
    const hh = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const mm = String(absOffset % 60).padStart(2, "0");

    return (
        ukDate.getFullYear() +
        "-" +
        String(ukDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(ukDate.getDate()).padStart(2, "0") +
        "T" +
        String(ukDate.getHours()).padStart(2, "0") +
        ":" +
        String(ukDate.getMinutes()).padStart(2, "0") +
        ":" +
        String(ukDate.getSeconds()).padStart(2, "0") +
        "." +
        String(ukDate.getMilliseconds()).padStart(3, "0") +
        sign +
        hh +
        ":" +
        mm
    );
}