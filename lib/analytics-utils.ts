export interface InteractionEntry {
    numOfInteractions?: number;
    num_of_interactions?: number;
    interactions?: number;
    count?: number;
    total?: number;
    loggedTime?: string;
    logged_time?: string;
    timestamp?: string;
    time?: string;
    date?: string;
    segmentInteractions?: Record<string, number> | string | null;
    segment_interactions?: Record<string, number> | string | null;
    segments?: Record<string, number> | string | null;
}

export interface NormalizedInteraction {
    loggedTime: string;
    date: Date;
    total: number;
    segments: Record<string, number>;
}

export type TimeGrouping = "day" | "hour" | "10min";

/**
 * Robustly normalizes an interaction entry:
 * 1. Resolves time from loggedTime, timestamp, date, etc.
 * 2. Parses segments (handles objects and JSON strings).
 * 3. Normalizes null/undefined/empty/"none"/"home"/"homepage" segment keys to "Home Page".
 * 4. Resolves unaccounted-for interactions (where total interactions > sum of segments) and adds them to "Home Page".
 * 5. Guarantees that `total` equals the exact sum of all segment interactions.
 */
export function normalizeInteraction(raw: any): NormalizedInteraction {
    if (!raw || typeof raw !== "object") {
        const now = new Date();
        return {
            loggedTime: now.toISOString(),
            date: now,
            total: 0,
            segments: {},
        };
    }

    // Resolve time
    const rawTime =
        raw.loggedTime ??
        raw.logged_time ??
        raw.timestamp ??
        raw.time ??
        raw.date ??
        "";

    let dateObj = new Date();
    let timeStr = String(rawTime).trim();

    if (timeStr && !isNaN(Number(timeStr))) {
        const num = Number(timeStr);
        // Epoch seconds vs milliseconds
        dateObj = new Date(num > 1e11 ? num : num * 1000);
    } else if (timeStr) {
        // Handle "YYYY-MM-DD HH:mm:ss" format
        if (timeStr.includes(" ") && !timeStr.includes("T")) {
            timeStr = timeStr.replace(" ", "T");
        }
        const parsed = new Date(timeStr);
        if (!isNaN(parsed.getTime())) {
            dateObj = parsed;
        }
    }

    // Resolve segments
    let rawSegments =
        raw.segmentInteractions ??
        raw.segment_interactions ??
        raw.segments ??
        {};

    if (typeof rawSegments === "string") {
        try {
            rawSegments = JSON.parse(rawSegments);
        } catch {
            rawSegments = {};
        }
    }
    if (typeof rawSegments !== "object" || rawSegments === null || Array.isArray(rawSegments)) {
        rawSegments = {};
    }

    const segments: Record<string, number> = {};
    let nonHomeSum = 0;
    let homeCount = 0;

    for (const [rawKey, rawCount] of Object.entries(rawSegments)) {
        const count =
            typeof rawCount === "number" && !isNaN(rawCount)
                ? Math.max(0, Math.round(rawCount))
                : !isNaN(Number(rawCount))
                ? Math.max(0, Math.round(Number(rawCount)))
                : 0;

        if (count === 0) continue;

        const trimmed = (rawKey ?? "").trim();
        const lower = trimmed.toLowerCase();

        // Any null, undefined, empty, "none", "home", "home page", "homepage" goes to Home Page
        if (
            !trimmed ||
            lower === "null" ||
            lower === "undefined" ||
            lower === "none" ||
            lower === "home" ||
            lower === "home page" ||
            lower === "homepage"
        ) {
            homeCount += count;
        } else {
            segments[trimmed] = (segments[trimmed] ?? 0) + count;
            nonHomeSum += count;
        }
    }

    // Resolve raw total count
    const rawNum =
        raw.numOfInteractions ??
        raw.num_of_interactions ??
        raw.interactions ??
        raw.count ??
        raw.total;

    const parsedTotal =
        typeof rawNum === "number" && !isNaN(rawNum)
            ? Math.max(0, Math.round(rawNum))
            : !isNaN(Number(rawNum))
            ? Math.max(0, Math.round(Number(rawNum)))
            : nonHomeSum + homeCount;

    // Unaccounted interactions = parsedTotal - nonHomeSum - homeCount
    const unaccounted = Math.max(0, parsedTotal - (nonHomeSum + homeCount));
    const finalHomeCount = homeCount + unaccounted;

    if (finalHomeCount > 0) {
        segments["Home Page"] = (segments["Home Page"] ?? 0) + finalHomeCount;
    }

    // Final total is strictly the sum of all segments
    const finalTotal = Object.values(segments).reduce((sum, c) => sum + c, 0);

    return {
        loggedTime: dateObj.toISOString(),
        date: dateObj,
        total: finalTotal,
        segments,
    };
}

/**
 * Builds a clean, localized bucket string for charts (prevents UTC timezone shift).
 */
export function getLocalBucket(d: Date, grouping: TimeGrouping): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    if (grouping === "day") {
        return dateStr;
    }

    const hours = String(d.getHours()).padStart(2, "0");
    if (grouping === "hour") {
        return `${dateStr} ${hours}:00`;
    }

    const m = Math.floor(d.getMinutes() / 10) * 10;
    const mins = String(m).padStart(2, "0");
    return `${dateStr} ${hours}:${mins}`;
}

/**
 * Formats a local bucket string for human-readable display on chart axes and tooltips.
 */
export function formatLocalBucket(bucket: string, grouping: TimeGrouping): string {
    if (!bucket) return "";

    const [datePart, timePart] = bucket.split(" ");
    const [y, m, d] = (datePart ?? "").split("-").map(Number);

    if (!y || !m || !d) return bucket;

    const localDate = new Date(y, m - 1, d);
    const dateFormatted = localDate.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });

    if (grouping === "day") {
        return dateFormatted;
    }

    if (!timePart) return dateFormatted;

    return `${dateFormatted} ${timePart}`;
}
