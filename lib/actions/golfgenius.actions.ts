"use server";

import { getUserInfo, saveUserInfo } from "@/lib/actions/user.actions";

export interface GolfGeniusEvent {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    category?: string;
    raw?: any;
}

export interface GolfGeniusRound {
    id: string;
    name: string;
    date?: string;
    status?: string;
    roundNumber?: number;
    raw?: any;
}

export interface GolfGeniusTournament {
    id: string;
    name: string;
    format?: string;
    status?: string;
    scope?: string;
    raw?: any;
}

/**
 * Low-level HTTP helper to communicate with Golf Genius API v2
 * Based on official docs: https://www.golfgenius.com/api/v2/docs
 * Path format: https://www.golfgenius.com/api_v2/{api_key}/{endpoint}
 */
async function golfGeniusFetch(endpoint: string, apiKey: string) {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
        throw new Error("Golf Genius API Key is required");
    }
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    const url = `https://www.golfgenius.com/api_v2/${cleanKey}/${cleanEndpoint}`;

    const res = await fetch(url, {
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${cleanKey}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `Golf Genius API error (${res.status} ${res.statusText})${
                text ? `: ${text.slice(0, 160)}` : ""
            }`
        );
    }

    return await res.json();
}

/**
 * Fetch all events for the current Golf Genius API key
 */
export async function getGolfGeniusEvents(apiKeyInput?: string): Promise<{
    success: boolean;
    events: GolfGeniusEvent[];
    error?: string;
}> {
    try {
        let apiKey = apiKeyInput?.trim();
        if (!apiKey) {
            const userInfo = await getUserInfo();
            apiKey = userInfo?.screenJson?.golfgenius_api_key?.trim();
        }

        if (!apiKey) {
            return {
                success: false,
                events: [],
                error: "No Golf Genius API Key found. Please configure an API Key.",
            };
        }

        const data = await golfGeniusFetch("events", apiKey);

        const rawList = Array.isArray(data)
            ? data
            : Array.isArray(data?.events)
            ? data.events
            : Array.isArray(data?.data)
            ? data.data
            : data?.event && typeof data.event === "object"
            ? [data.event]
            : [];

        const events: GolfGeniusEvent[] = rawList.map((item: any, index: number) => {
            const e = item?.event ?? item ?? {};
            // Treat 64-bit IDs as strings to prevent precision issues
            const id = String(e.id_str ?? e.id ?? e.event_id ?? `evt-${index + 1}`);
            const name = String(e.name ?? item?.event?.name ?? e.title ?? e.event_name ?? `Event #${id}`);
            const startDate = e.start_date ?? e.startDate ?? e.date ?? e.start_date_str ?? undefined;
            const endDate = e.end_date ?? e.endDate ?? e.end_date_str ?? undefined;
            const status = e.status ?? (e.active ? "active" : undefined);
            const category = e.category ?? e.season ?? undefined;

            return {
                id,
                name,
                startDate: startDate ? String(startDate) : undefined,
                endDate: endDate ? String(endDate) : undefined,
                status: status ? String(status) : undefined,
                category: category ? String(category) : undefined,
                raw: e,
            };
        });

        return { success: true, events };
    } catch (err: any) {
        console.error("getGolfGeniusEvents error:", err);
        return {
            success: false,
            events: [],
            error: err.message || "Failed to fetch events from Golf Genius",
        };
    }
}

/**
 * Fetch rounds for an event
 */
export async function getGolfGeniusRounds(
    eventId: string,
    apiKeyInput?: string
): Promise<{
    success: boolean;
    rounds: GolfGeniusRound[];
    error?: string;
}> {
    try {
        if (!eventId) {
            return { success: false, rounds: [], error: "Event ID is required" };
        }

        let apiKey = apiKeyInput?.trim();
        if (!apiKey) {
            const userInfo = await getUserInfo();
            apiKey = userInfo?.screenJson?.golfgenius_api_key?.trim();
        }

        if (!apiKey) {
            return { success: false, rounds: [], error: "No Golf Genius API Key found." };
        }

        const data = await golfGeniusFetch(`events/${eventId}/rounds`, apiKey);

        const rawList = Array.isArray(data)
            ? data
            : Array.isArray(data?.rounds)
            ? data.rounds
            : Array.isArray(data?.event_rounds)
            ? data.event_rounds
            : Array.isArray(data?.data)
            ? data.data
            : [];

        const rounds: GolfGeniusRound[] = rawList.map((item: any, index: number) => {
            const r = item?.round ?? item?.event_round ?? item ?? {};
            const id = String(r.id_str ?? r.id ?? r.round_id ?? `rnd-${index + 1}`);
            const name = String(r.name ?? r.title ?? `Round ${r.round_number ?? index + 1}`);
            const date = r.date ?? r.round_date ?? undefined;
            const status = r.status ?? undefined;
            const roundNumber = typeof r.round_number === "number" ? r.round_number : index + 1;

            return {
                id,
                name,
                date: date ? String(date) : undefined,
                status: status ? String(status) : undefined,
                roundNumber,
                raw: r,
            };
        });

        return { success: true, rounds };
    } catch (err: any) {
        console.error("getGolfGeniusRounds error:", err);
        return {
            success: false,
            rounds: [],
            error: err.message || "Failed to fetch rounds from Golf Genius",
        };
    }
}

/**
 * Fetch tournaments for a round (or event fallback)
 */
export async function getGolfGeniusTournaments(
    eventId: string,
    roundId?: string,
    apiKeyInput?: string
): Promise<{
    success: boolean;
    tournaments: GolfGeniusTournament[];
    error?: string;
}> {
    try {
        if (!eventId) {
            return { success: false, tournaments: [], error: "Event ID is required" };
        }

        let apiKey = apiKeyInput?.trim();
        if (!apiKey) {
            const userInfo = await getUserInfo();
            apiKey = userInfo?.screenJson?.golfgenius_api_key?.trim();
        }

        if (!apiKey) {
            return { success: false, tournaments: [], error: "No Golf Genius API Key found." };
        }

        let data: any = null;
        let lastError: any = null;

        // Try round-level tournaments first if roundId is given
        if (roundId) {
            try {
                data = await golfGeniusFetch(`events/${eventId}/rounds/${roundId}/tournaments`, apiKey);
            } catch (err) {
                lastError = err;
            }
        }

        // Fallback to event-level tournaments if round-level failed or roundId was not specified
        if (!data) {
            try {
                data = await golfGeniusFetch(`events/${eventId}/tournaments`, apiKey);
            } catch (err) {
                if (!lastError) lastError = err;
            }
        }

        if (!data) {
            throw lastError || new Error("Failed to retrieve tournaments from Golf Genius");
        }

        let rawList: any[] = [];
        if (Array.isArray(data)) {
            rawList = data;
        } else if (Array.isArray(data?.tournaments)) {
            rawList = data.tournaments;
        } else if (Array.isArray(data?.event_round_tournaments)) {
            rawList = data.event_round_tournaments;
        } else if (Array.isArray(data?.event?.tournaments)) {
            rawList = data.event.tournaments;
        } else if (Array.isArray(data?.event?.event_round_tournaments)) {
            rawList = data.event.event_round_tournaments;
        } else if (Array.isArray(data?.data)) {
            rawList = data.data;
        } else if (data?.event && typeof data.event === "object") {
            // In Golf Genius, a tournament/event object can be wrapped under "event":
            // e.g. "event": { "name": "Ardglass Golf Club - Advanced", "adjusted": false, ... }
            rawList = [data.event];
        } else if (data?.tournament && typeof data.tournament === "object") {
            rawList = [data.tournament];
        } else if (data && typeof data === "object" && (data.name || data.id || data.id_str)) {
            rawList = [data];
        }

        const tournaments: GolfGeniusTournament[] = rawList.map((item: any, index: number) => {
            const t = item?.tournament ?? item?.event ?? item ?? {};
            const id = String(
                t.id_str ??
                t.id ??
                t.tournament_id ??
                t.event_id ??
                item?.id_str ??
                item?.id ??
                item?.tournament_id ??
                item?.event_id ??
                item?.event?.id_str ??
                item?.event?.id ??
                `trn-${index + 1}`
            );
            // Check t.name, item.event.name, t.event.name, t.tournament.name, etc.
            const name = String(
                t.name ??
                item?.event?.name ??
                t.event?.name ??
                item?.tournament?.name ??
                t.tournament_name ??
                t.event_name ??
                t.title ??
                item?.name ??
                `Tournament #${id}`
            );
            const format = t.format ?? t.score_format ?? t.handicap_format ?? item?.event?.format ?? undefined;
            const status = t.status ?? item?.event?.status ?? undefined;
            const scope = t.scope ?? item?.event?.scope ?? undefined;

            return {
                id,
                name,
                format: format ? String(format) : undefined,
                status: status ? String(status) : undefined,
                scope: scope ? String(scope) : undefined,
                raw: t,
            };
        });

        return { success: true, tournaments };
    } catch (err: any) {
        console.error("getGolfGeniusTournaments error:", err);
        return {
            success: false,
            tournaments: [],
            error: err.message || "Failed to fetch tournaments from Golf Genius",
        };
    }
}

/**
 * Test the Golf Genius connection with a provided or saved API key
 */
export async function testGolfGeniusConnection(apiKeyInput?: string): Promise<{
    success: boolean;
    eventCount?: number;
    error?: string;
}> {
    const result = await getGolfGeniusEvents(apiKeyInput);
    if (!result.success) {
        return { success: false, error: result.error };
    }
    return { success: true, eventCount: result.events.length };
}

/**
 * Fetch tournament results (e.g. JSON leaderboard) for preview
 */
export async function getGolfGeniusTournamentResults(
    eventId: string,
    roundId: string,
    tournamentId: string,
    apiKeyInput?: string
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        let apiKey = apiKeyInput?.trim();
        if (!apiKey) {
            const userInfo = await getUserInfo();
            apiKey = userInfo?.screenJson?.golfgenius_api_key?.trim();
        }
        if (!apiKey) return { success: false, error: "No Golf Genius API Key found" };

        const data = await golfGeniusFetch(
            `events/${eventId}/rounds/${roundId}/tournaments/${tournamentId}.json`,
            apiKey
        );
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Save Golf Genius settings to the active screen's screenJson
 * Fields updated:
 * - golfgenius_api_key
 * - golfgenius_event_id
 * - golfgenius_round_id
 * - golfgenius_tournament_id
 */
export async function saveGolfGeniusConfig(config: {
    apiKey?: string;
    eventId: string;
    roundId: string;
    tournamentId: string;
    eventName?: string;
    roundName?: string;
    tournamentName?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const userInfo = await getUserInfo();
        if (!userInfo || !userInfo.screenJson) {
            return {
                success: false,
                error: "No active screen loaded. Please select a screen first.",
            };
        }

        const currentJson = { ...userInfo.screenJson };

        // Save the 4 exact properties in screen JSON
        if (config.apiKey !== undefined) {
            currentJson.golfgenius_api_key = String(config.apiKey).trim();
        }
        currentJson.golfgenius_event_id = String(config.eventId ?? "").trim();
        currentJson.golfgenius_round_id = String(config.roundId ?? "").trim();
        currentJson.golfgenius_tournament_id = String(config.tournamentId ?? "").trim();

        // Also persist human-friendly names so tournament name is immediately visible
        if (config.tournamentName !== undefined) {
            currentJson.golfgenius_tournament_name = String(config.tournamentName ?? "").trim();
        }
        if (config.eventName !== undefined) {
            currentJson.golfgenius_event_name = String(config.eventName ?? "").trim();
        }
        if (config.roundName !== undefined) {
            currentJson.golfgenius_round_name = String(config.roundName ?? "").trim();
        }

        await saveUserInfo({
            screenJson: currentJson,
            lastEdited: new Date(),
            lastEditedBy: userInfo.userId,
            lastEditedByName: userInfo.fullName,
        });

        return { success: true };
    } catch (err: any) {
        console.error("saveGolfGeniusConfig error:", err);
        return {
            success: false,
            error: err.message || "Failed to save Golf Genius configuration",
        };
    }
}
