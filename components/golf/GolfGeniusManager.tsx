"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Trophy,
    Calendar,
    Key,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    ExternalLink,
    Loader2,
    Save,
    RotateCcw,
    Layers,
    SlidersHorizontal,
    Search,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDirtyState, usePreviewState } from "@/stores/user-store";
import { toast } from "sonner";
import {
    getGolfGeniusEvents,
    getGolfGeniusRounds,
    getGolfGeniusTournaments,
    saveGolfGeniusConfig,
    testGolfGeniusConnection,
    getGolfGeniusTournamentResults,
    type GolfGeniusEvent,
    type GolfGeniusRound,
    type GolfGeniusTournament,
} from "@/lib/actions/golfgenius.actions";

interface Props {
    screenName: string;
    screenJson: any;
}

export default function GolfGeniusManager({ screenName, screenJson }: Props) {
    const { setDirty } = useDirtyState();
    const { setDraftJson } = usePreviewState();

    // Initial values from screenJson (internal keys)
    const initialApiKey = String(screenJson?.golfgenius_api_key ?? "").trim();
    const initialEventId = String(screenJson?.golfgenius_event_id ?? "").trim();
    const initialRoundId = String(screenJson?.golfgenius_round_id ?? "").trim();
    const initialTournamentId = String(screenJson?.golfgenius_tournament_id ?? "").trim();
    const initialTournamentName = String(screenJson?.golfgenius_tournament_name ?? "").trim();
    const initialEventName = String(screenJson?.golfgenius_event_name ?? "").trim();
    const initialRoundName = String(screenJson?.golfgenius_round_name ?? "").trim();

    // Active state
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [selectedEventId, setSelectedEventId] = useState(initialEventId);
    const [selectedRoundId, setSelectedRoundId] = useState(initialRoundId);
    const [selectedTournamentId, setSelectedTournamentId] = useState(initialTournamentId);
    const [tournamentName, setTournamentName] = useState(initialTournamentName);
    const [eventName, setEventName] = useState(initialEventName);
    const [roundName, setRoundName] = useState(initialRoundName);

    // Show/hide API key
    const [showApiKey, setShowApiKey] = useState(false);

    // Lists
    const [events, setEvents] = useState<GolfGeniusEvent[]>([]);
    const [rounds, setRounds] = useState<GolfGeniusRound[]>([]);
    const [tournaments, setTournaments] = useState<GolfGeniusTournament[]>([]);

    // Loading states
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [isLoadingRounds, setIsLoadingRounds] = useState(false);
    const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("saved");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<{
        checked: boolean;
        success: boolean;
        message?: string;
    }>({ checked: false, success: false });

    // Debounce timer ref for autosave
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Filter/search for events
    const [eventSearch, setEventSearch] = useState("");


    // Mode: Picker vs Manual input
    const [manualMode, setManualMode] = useState(false);

    // Has unsaved changes
    const hasChanges =
        apiKey !== initialApiKey ||
        selectedEventId !== initialEventId ||
        selectedRoundId !== initialRoundId ||
        selectedTournamentId !== initialTournamentId;

    /* -------------------------------------------------------------------------- */
    /*  Fetch Events                                                              */
    /* -------------------------------------------------------------------------- */
    const fetchEvents = async (keyToUse = apiKey) => {
        if (!keyToUse.trim()) return;
        setIsLoadingEvents(true);
        setConnectionStatus({ checked: false, success: false });
        try {
            const res = await getGolfGeniusEvents(keyToUse);
            if (res.success) {
                setEvents(res.events);
                setConnectionStatus({
                    checked: true,
                    success: true,
                    message: `Connected successfully! Found ${res.events.length} event${res.events.length === 1 ? "" : "s"}.`,
                });
            } else {
                setEvents([]);
                setConnectionStatus({
                    checked: true,
                    success: false,
                    message: res.error || "Failed to load events. Please check your API Key.",
                });
            }
        } catch (err: any) {
            setEvents([]);
            setConnectionStatus({
                checked: true,
                success: false,
                message: err.message || "Failed to connect to Golf Genius.",
            });
        } finally {
            setIsLoadingEvents(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*  Fetch Rounds                                                              */
    /* -------------------------------------------------------------------------- */
    const fetchRounds = async (eventId: string, keyToUse = apiKey) => {
        if (!eventId || !keyToUse.trim()) {
            setRounds([]);
            return;
        }
        setIsLoadingRounds(true);
        try {
            const res = await getGolfGeniusRounds(eventId, keyToUse);
            if (res.success) {
                setRounds(res.rounds);
            } else {
                setRounds([]);
                toast.error(res.error || "Failed to load rounds for event");
            }
        } catch (err: any) {
            setRounds([]);
            toast.error(err.message || "Failed to load rounds");
        } finally {
            setIsLoadingRounds(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*  Fetch Tournaments                                                         */
    /* -------------------------------------------------------------------------- */
    const fetchTournaments = async (eventId: string, roundId?: string, keyToUse = apiKey) => {
        if (!eventId || !keyToUse.trim()) {
            setTournaments([]);
            return;
        }
        setIsLoadingTournaments(true);
        try {
            const res = await getGolfGeniusTournaments(eventId, roundId, keyToUse);
            if (res.success) {
                setTournaments(res.tournaments);
            } else {
                setTournaments([]);
                toast.error(res.error || "Failed to load competitions");
            }
        } catch (err: any) {
            setTournaments([]);
            toast.error(err.message || "Failed to load competitions");
        } finally {
            setIsLoadingTournaments(false);
        }
    };

    // Load initial events on mount if apiKey exists
    useEffect(() => {
        if (apiKey) {
            fetchEvents(apiKey);
        }
    }, []);

    // Load rounds when initial event is present
    useEffect(() => {
        if (initialEventId && apiKey) {
            fetchRounds(initialEventId, apiKey);
        }
    }, [initialEventId]);

    // Load tournaments when initial round is present
    useEffect(() => {
        if (initialEventId && initialRoundId && apiKey) {
            fetchTournaments(initialEventId, initialRoundId, apiKey);
        }
    }, [initialEventId, initialRoundId]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Sync names from fetched lists if IDs match
    useEffect(() => {
        if (selectedEventId && events.length > 0) {
            const found = events.find((e) => e.id === selectedEventId);
            if (found?.name && found.name !== eventName) {
                setEventName(found.name);
            }
        }
    }, [selectedEventId, events]);

    useEffect(() => {
        if (selectedRoundId && rounds.length > 0) {
            const found = rounds.find((r) => r.id === selectedRoundId);
            if (found?.name && found.name !== roundName) {
                setRoundName(found.name);
            }
        }
    }, [selectedRoundId, rounds]);

    useEffect(() => {
        if (selectedTournamentId && tournaments.length > 0) {
            const found = tournaments.find((t) => t.id === selectedTournamentId);
            if (found?.name && found.name !== tournamentName) {
                setTournamentName(found.name);
                // Also update the saved config so the tournament name is persisted
                executeSave({ tournamentName: found.name });
            }
        }
    }, [selectedTournamentId, tournaments]);

    /* -------------------------------------------------------------------------- */
    /*  Auto-Save Engine                                                          */
    /* -------------------------------------------------------------------------- */
    const executeSave = async (cfg: {
        apiKey?: string;
        eventId?: string;
        roundId?: string;
        tournamentId?: string;
        tournamentName?: string;
        eventName?: string;
        roundName?: string;
    }) => {
        setIsSaving(true);
        setSaveStatus("saving");

        const targetApiKey = cfg.apiKey !== undefined ? cfg.apiKey : apiKey;
        const targetEventId = cfg.eventId !== undefined ? cfg.eventId : selectedEventId;
        const targetRoundId = cfg.roundId !== undefined ? cfg.roundId : selectedRoundId;
        const targetTournamentId = cfg.tournamentId !== undefined ? cfg.tournamentId : selectedTournamentId;
        const targetTournamentName = cfg.tournamentName !== undefined ? cfg.tournamentName : tournamentName;
        const targetEventName = cfg.eventName !== undefined ? cfg.eventName : eventName;
        const targetRoundName = cfg.roundName !== undefined ? cfg.roundName : roundName;

        try {
            const res = await saveGolfGeniusConfig({
                apiKey: targetApiKey,
                eventId: targetEventId,
                roundId: targetRoundId,
                tournamentId: targetTournamentId,
                tournamentName: targetTournamentName,
                eventName: targetEventName,
                roundName: targetRoundName,
            });

            if (res.success) {
                if (screenJson) {
                    const updated = {
                        ...screenJson,
                        golfgenius_api_key: targetApiKey.trim(),
                        golfgenius_event_id: targetEventId.trim(),
                        golfgenius_round_id: targetRoundId.trim(),
                        golfgenius_tournament_id: targetTournamentId.trim(),
                        golfgenius_tournament_name: targetTournamentName.trim(),
                        golfgenius_event_name: targetEventName.trim(),
                        golfgenius_round_name: targetRoundName.trim(),
                    };
                    setDraftJson(updated);
                }
                setDirty(true);
                setSaveStatus("saved");
                setLastSavedAt(new Date());
            } else {
                setSaveStatus("error");
                toast.error(res.error || "Failed to auto-save settings");
            }
        } catch (err: any) {
            setSaveStatus("error");
            toast.error(err.message || "An unexpected error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    const triggerDebouncedSave = (cfg: {
        apiKey?: string;
        eventId?: string;
        roundId?: string;
        tournamentId?: string;
        tournamentName?: string;
        eventName?: string;
        roundName?: string;
    }) => {
        setSaveStatus("idle");
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            executeSave(cfg);
        }, 800);
    };

    /* -------------------------------------------------------------------------- */
    /*  Handle Selections (Immediate Auto-Save)                                   */
    /* -------------------------------------------------------------------------- */
    const handleSelectEvent = (eventId: string) => {
        setSelectedEventId(eventId);
        const obj = events.find((e) => e.id === eventId);
        const newEventName = obj?.name || "";
        if (newEventName) {
            setEventName(newEventName);
        }
        setSelectedRoundId("");
        setSelectedTournamentId("");
        setRoundName("");
        setTournamentName("");
        setTournaments([]);
        setPreviewData(null);
        setShowPreview(false);
        if (eventId) {
            fetchRounds(eventId);
        } else {
            setRounds([]);
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        executeSave({
            eventId,
            roundId: "",
            tournamentId: "",
            eventName: newEventName,
            roundName: "",
            tournamentName: "",
        });
    };

    const handleSelectRound = (roundId: string) => {
        setSelectedRoundId(roundId);
        const obj = rounds.find((r) => r.id === roundId);
        const newRoundName = obj?.name || "";
        if (newRoundName) {
            setRoundName(newRoundName);
        }
        setSelectedTournamentId("");
        setTournamentName("");
        setPreviewData(null);
        setShowPreview(false);
        if (roundId && selectedEventId) {
            fetchTournaments(selectedEventId, roundId);
        } else {
            setTournaments([]);
        }

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        executeSave({
            eventId: selectedEventId,
            roundId,
            tournamentId: "",
            eventName: selectedEventObj?.name || eventName,
            roundName: newRoundName,
            tournamentName: "",
        });
    };

    const handleSelectTournament = (tournamentId: string) => {
        setSelectedTournamentId(tournamentId);
        const obj = tournaments.find((t) => t.id === tournamentId);
        const newTournName = obj?.name || "";
        if (newTournName) {
            setTournamentName(newTournName);
        }
        setPreviewData(null);
        setShowPreview(false);

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        executeSave({
            eventId: selectedEventId,
            roundId: selectedRoundId,
            tournamentId,
            eventName: selectedEventObj?.name || eventName,
            roundName: selectedRoundObj?.name || roundName,
            tournamentName: newTournName || tournamentName,
        });
    };

    /* -------------------------------------------------------------------------- */
    /*  Handle Manual Input Changes (Debounced Auto-Save)                         */
    /* -------------------------------------------------------------------------- */
    const handleApiKeyChange = (val: string) => {
        setApiKey(val);
        triggerDebouncedSave({ apiKey: val });
    };

    const handleManualEventIdChange = (val: string) => {
        setSelectedEventId(val);
        triggerDebouncedSave({ eventId: val });
    };

    const handleManualRoundIdChange = (val: string) => {
        setSelectedRoundId(val);
        triggerDebouncedSave({ roundId: val });
    };

    const handleManualTournamentIdChange = (val: string) => {
        setSelectedTournamentId(val);
        triggerDebouncedSave({ tournamentId: val });
    };

    const handleReset = () => {
        setApiKey(initialApiKey);
        setSelectedEventId(initialEventId);
        setSelectedRoundId(initialRoundId);
        setSelectedTournamentId(initialTournamentId);
        setTournamentName(initialTournamentName);
        setEventName(initialEventName);
        setRoundName(initialRoundName);
        if (initialEventId && initialApiKey) {
            fetchRounds(initialEventId, initialApiKey);
        }
        if (initialEventId && initialRoundId && initialApiKey) {
            fetchTournaments(initialEventId, initialRoundId, initialApiKey);
        }
        executeSave({
            apiKey: initialApiKey,
            eventId: initialEventId,
            roundId: initialRoundId,
            tournamentId: initialTournamentId,
            tournamentName: initialTournamentName,
            eventName: initialEventName,
            roundName: initialRoundName,
        });
        toast.info("Reverted to previous values and saved");
    };

    /* -------------------------------------------------------------------------- */
    /*  Test Connection                                                           */
    /* -------------------------------------------------------------------------- */
    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            toast.error("Please enter your Golf Genius API Key first");
            return;
        }
        setIsTesting(true);
        try {
            const res = await testGolfGeniusConnection(apiKey);
            if (res.success) {
                setConnectionStatus({
                    checked: true,
                    success: true,
                    message: `Connection successful! Found ${res.eventCount} active event${res.eventCount === 1 ? "" : "s"}.`,
                });
                toast.success(`Connected to Golf Genius! (${res.eventCount} events found)`);
                fetchEvents(apiKey);
            } else {
                setConnectionStatus({
                    checked: true,
                    success: false,
                    message: res.error || "Connection failed. Please check your API Key.",
                });
                toast.error(res.error || "Connection failed. Please check your API Key.");
            }
        } catch (err: any) {
            setConnectionStatus({
                checked: true,
                success: false,
                message: err.message || "Network error",
            });
            toast.error("Failed to connect to Golf Genius");
        } finally {
            setIsTesting(false);
        }
    };

    /* -------------------------------------------------------------------------- */
    /*  Preview Tournament Results                                                */
    /* -------------------------------------------------------------------------- */
    const handlePreviewResults = async () => {
        if (!selectedEventId || !selectedRoundId || !selectedTournamentId) {
            toast.error("Please pick an Event, Round, and Competition first");
            return;
        }
        setPreviewLoading(true);
        setShowPreview(true);
        try {
            const res = await getGolfGeniusTournamentResults(
                selectedEventId,
                selectedRoundId,
                selectedTournamentId,
                apiKey
            );
            if (res.success) {
                setPreviewData(res.data);
                const detectedName =
                    res.data?.event?.name ||
                    res.data?.tournament?.name ||
                    res.data?.name;
                if (detectedName) {
                    setTournamentName(detectedName);
                }
                toast.success("Leaderboard results retrieved!");
            } else {
                setPreviewData(null);
                toast.info("No leaderboard data yet or results not released for this tournament.");
            }
        } catch (err: any) {
            setPreviewData(null);
            toast.error("Could not fetch preview: " + err.message);
        } finally {
            setPreviewLoading(false);
        }
    };

    // Filter events based on search
    const filteredEvents = events.filter((e) => {
        if (!eventSearch.trim()) return true;
        const q = eventSearch.toLowerCase();
        return (
            e.name.toLowerCase().includes(q) ||
            (e.startDate && e.startDate.toLowerCase().includes(q))
        );
    });

    const selectedEventObj = events.find((e) => e.id === selectedEventId);
    const selectedRoundObj = rounds.find((r) => r.id === selectedRoundId);
    const selectedTournamentObj = tournaments.find((t) => t.id === selectedTournamentId);

    return (
        <div className="space-y-6">
            {/* OVERVIEW & STATUS CARD */}
            <Card className="border-t-4 border-t-emerald-600 shadow-xs">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-emerald-600" />
                                <CardTitle className="text-xl font-bold">
                                    Golf Genius Live Scoring & Tournaments
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {screenName}
                                </Badge>
                            </div>
                            <CardDescription className="text-xs">
                                Choose which event, round, and competition leaderboard to display live on this screen.
                            </CardDescription>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href="https://www.golfgenius.com/api/v2/docs"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2.5 py-1.5 rounded-md border bg-background"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Golf Genius Help & Docs
                            </a>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setManualMode((v) => !v)}
                                className="text-xs"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
                                {manualMode ? "Select from List" : "Enter IDs Manually"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-muted/30 p-3.5 rounded-xl border border-muted">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Screen Type
                            </span>
                            <span className="text-sm font-semibold flex items-center gap-1 text-emerald-600 mt-0.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Golf Club Screen
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Connection
                            </span>
                            <span className="text-sm font-semibold flex items-center gap-1 mt-0.5">
                                {apiKey ? (
                                    <span className="text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                                    </span>
                                ) : (
                                    <span className="text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="h-3.5 w-3.5" /> Key Missing
                                    </span>
                                )}
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Selected Tournament
                            </span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate block mt-0.5" title={selectedTournamentObj?.name || tournamentName || selectedEventObj?.name || eventName}>
                                {selectedTournamentObj?.name ||
                                    tournamentName ||
                                    selectedEventObj?.name ||
                                    eventName ||
                                    (selectedTournamentId
                                        ? `Tournament #${selectedTournamentId}`
                                        : "None selected")}
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Status
                            </span>
                            <div className="mt-0.5">
                                {saveStatus === "saving" ? (
                                    <Badge variant="outline" className="border-blue-500/50 text-blue-600 bg-blue-500/10 text-xs flex items-center gap-1.5 w-fit">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Saving changes…
                                    </Badge>
                                ) : saveStatus === "saved" ? (
                                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-500/10 text-xs flex items-center gap-1.5 w-fit">
                                        <CheckCircle2 className="h-3 w-3" /> Saved automatically
                                    </Badge>
                                ) : saveStatus === "error" ? (
                                    <Badge variant="destructive" className="text-xs flex items-center gap-1.5 w-fit">
                                        <AlertCircle className="h-3 w-3" /> Save failed
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10 text-xs flex items-center gap-1.5 w-fit">
                                        Unsaved edits…
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* API KEY CONFIGURATION */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-primary" />
                            Golf Genius Account Connection
                        </span>
                        {connectionStatus.checked && (
                            <Badge
                                variant={connectionStatus.success ? "default" : "destructive"}
                                className="text-xs font-normal"
                            >
                                {connectionStatus.success ? "Connection Verified" : "Connection Error"}
                            </Badge>
                        )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Connects securely to your club&apos;s Golf Genius account to retrieve upcoming events and live scores.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                            <Input
                                type={showApiKey ? "text" : "password"}
                                value={apiKey}
                                onChange={(e) => handleApiKeyChange(e.target.value)}
                                placeholder="Enter your Golf Genius API Key…"
                                className="pr-10 text-sm font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                title={showApiKey ? "Hide key" : "Show key"}
                            >
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={handleTestConnection}
                            disabled={isTesting || !apiKey.trim()}
                            className="shrink-0"
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Testing…
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-1.5" /> Test Connection
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => fetchEvents(apiKey)}
                            disabled={isLoadingEvents || !apiKey.trim()}
                            className="shrink-0"
                        >
                            {isLoadingEvents ? (
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4 mr-1.5" />
                            )}
                            Refresh Events
                        </Button>
                    </div>

                    {connectionStatus.checked && connectionStatus.message && (
                        <p
                            className={`text-xs ${
                                connectionStatus.success
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-destructive"
                            }`}
                        >
                            {connectionStatus.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* SELECTION WORKFLOW */}
            {!manualMode ? (
                <div className="space-y-5">
                    {/* STEP 1: EVENT SELECTION */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        1
                                    </span>
                                    <span>Choose Event</span>
                                </CardTitle>
                                {events.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {events.length} event{events.length === 1 ? "" : "s"} available
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="text-xs">
                                Select the golf tournament, league, or club event you want to feature.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {events.length > 0 && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search events by name or date…"
                                        value={eventSearch}
                                        onChange={(e) => setEventSearch(e.target.value)}
                                        className="pl-9 h-9 text-xs"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Select
                                    value={selectedEventId}
                                    onValueChange={handleSelectEvent}
                                    disabled={isLoadingEvents || events.length === 0}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                isLoadingEvents
                                                    ? "Loading events from Golf Genius…"
                                                    : events.length === 0
                                                    ? "No events found (click Refresh Events above)"
                                                    : "Select an event…"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-72">
                                        {filteredEvents.map((evt) => (
                                            <SelectItem key={evt.id} value={evt.id}>
                                                <div className="flex items-center justify-between gap-3 text-left w-full py-0.5">
                                                    <span className="font-medium truncate">{evt.name}</span>
                                                    {evt.startDate && (
                                                        <span className="text-xs text-muted-foreground shrink-0">
                                                            {evt.startDate}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {selectedEventObj && (
                                    <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1 border">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-foreground text-sm">
                                                {selectedEventObj.name}
                                            </span>
                                            {selectedEventObj.status && (
                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                    {selectedEventObj.status}
                                                </Badge>
                                            )}
                                        </div>
                                        {(selectedEventObj.startDate || selectedEventObj.endDate) && (
                                            <div className="text-muted-foreground flex items-center gap-1.5 pt-0.5">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {selectedEventObj.startDate}
                                                    {selectedEventObj.endDate && ` — ${selectedEventObj.endDate}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* STEP 2: ROUND SELECTION */}
                    <Card className={!selectedEventId ? "opacity-60 pointer-events-none" : ""}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        2
                                    </span>
                                    <span>Choose Round</span>
                                </CardTitle>
                                {rounds.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {rounds.length} round{rounds.length === 1 ? "" : "s"}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="text-xs">
                                Select which round of the event to display (e.g. Round 1, Round 2, Final Round).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                value={selectedRoundId}
                                onValueChange={handleSelectRound}
                                disabled={!selectedEventId || isLoadingRounds}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            isLoadingRounds
                                                ? "Loading rounds…"
                                                : rounds.length === 0
                                                ? "No rounds found for this event"
                                                : "Select a round…"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {rounds.map((rnd) => (
                                        <SelectItem key={rnd.id} value={rnd.id}>
                                            <div className="flex items-center justify-between gap-3 text-left w-full py-0.5">
                                                <span className="font-medium truncate">{rnd.name}</span>
                                                {rnd.date && (
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {rnd.date}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedRoundObj && (
                                <div className="bg-muted/40 p-3 rounded-lg text-xs space-y-1 border">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-foreground text-sm">
                                            {selectedRoundObj.name}
                                        </span>
                                        {selectedRoundObj.status && (
                                            <Badge variant="outline" className="text-[10px] capitalize">
                                                {selectedRoundObj.status}
                                            </Badge>
                                        )}
                                    </div>
                                    {selectedRoundObj.date && (
                                        <div className="text-muted-foreground flex items-center gap-1.5 pt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            <span>{selectedRoundObj.date}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* STEP 3: TOURNAMENT SELECTION */}
                    <Card className={!selectedRoundId ? "opacity-60 pointer-events-none" : ""}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        3
                                    </span>
                                    <span>Choose Tournament / Competition</span>
                                </CardTitle>
                                {tournaments.length > 0 && (
                                    <Badge variant="outline" className="text-xs">
                                        {tournaments.length} competition{tournaments.length === 1 ? "" : "s"}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="text-xs">
                                Select the specific competition format to display on the leaderboard (e.g. Gross Stroke Play, Stableford, Skins).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                value={selectedTournamentId}
                                onValueChange={handleSelectTournament}
                                disabled={!selectedRoundId || isLoadingTournaments}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue
                                        placeholder={
                                            isLoadingTournaments
                                                ? "Loading competitions…"
                                                : tournaments.length === 0
                                                ? "No competitions configured for this round"
                                                : "Select a competition…"
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent className="max-h-60">
                                    {tournaments.map((trn) => (
                                        <SelectItem key={trn.id} value={trn.id}>
                                            <div className="flex items-center justify-between gap-3 text-left w-full py-0.5">
                                                <span className="font-medium truncate">{trn.name}</span>
                                                {trn.format && (
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {trn.format}
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(selectedTournamentObj || tournamentName) && (
                                <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-3.5 rounded-xl text-xs space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                                            <Trophy className="h-4 w-4 text-emerald-600" />
                                            Active Tournament Name
                                        </span>
                                        {selectedTournamentObj?.format && (
                                            <Badge variant="outline" className="text-[10px] bg-background">
                                                {selectedTournamentObj.format}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-base font-extrabold text-foreground">
                                        {selectedTournamentObj?.name || tournamentName}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This tournament name will be displayed live on the screen leaderboard.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* MANUAL ID ENTRY MODE */
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-primary" />
                            Manual ID Entry
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Directly enter your Golf Genius identifiers if you prefer to paste them from your Golf Genius portal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    API Key
                                </Label>
                                <Input
                                    value={apiKey}
                                    onChange={(e) => handleApiKeyChange(e.target.value)}
                                    placeholder="Enter your Golf Genius API Key…"
                                    className="font-mono text-xs"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Your club&apos;s Golf Genius customer API key.
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Event ID
                                </Label>
                                <Input
                                    value={selectedEventId}
                                    onChange={(e) => handleManualEventIdChange(e.target.value)}
                                    placeholder="e.g. 2847591023411234567"
                                    className="font-mono text-xs"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Unique identifier for the event in Golf Genius.
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Round ID
                                </Label>
                                <Input
                                    value={selectedRoundId}
                                    onChange={(e) => handleManualRoundIdChange(e.target.value)}
                                    placeholder="e.g. 2847591023411234568"
                                    className="font-mono text-xs"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Unique identifier for the round in Golf Genius.
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">
                                    Tournament / Competition ID
                                </Label>
                                <Input
                                    value={selectedTournamentId}
                                    onChange={(e) => handleManualTournamentIdChange(e.target.value)}
                                    placeholder="e.g. 2847591023411234569"
                                    className="font-mono text-xs"
                                />
                                <span className="text-[11px] text-muted-foreground">
                                    Unique identifier for the competition format in Golf Genius.
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* SELECTION SUMMARY & SAVE */}
            <Card className="border-t-4 border-t-primary shadow-xs">
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Layers className="h-4 w-4 text-primary" />
                                Selected Tournament Details
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Selections save automatically. Click &quot;Apply Changes&quot; in the top bar whenever you are ready to update the live screen.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {saveStatus === "saving" ? (
                                <span className="text-xs text-blue-600 flex items-center gap-1.5">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Saving changes…
                                </span>
                            ) : saveStatus === "saved" ? (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Saved automatically {lastSavedAt ? `(${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})` : ""}
                                </span>
                            ) : null}

                            {hasChanges && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    disabled={isSaving}
                                    className="text-xs"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Revert
                                </Button>
                            )}

                            <Button
                                size="sm"
                                onClick={() => executeSave({})}
                                disabled={isSaving}
                                variant={saveStatus === "saved" ? "outline" : "default"}
                                className="text-xs"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                                        Saving…
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-3.5 w-3.5 mr-1" />
                                        Save Now
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 bg-muted/40 p-3.5 rounded-xl border">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Account Key
                            </span>
                            <span className="text-xs font-mono font-medium block truncate mt-0.5">
                                {apiKey ? (showApiKey ? apiKey : `••••••••••••••••`) : "Not configured"}
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Event
                            </span>
                            <span className="text-xs font-medium block truncate mt-0.5" title={selectedEventObj?.name}>
                                {selectedEventObj?.name || (selectedEventId ? `Event #${selectedEventId}` : "Not selected")}
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Round
                            </span>
                            <span className="text-xs font-medium block truncate mt-0.5" title={selectedRoundObj?.name}>
                                {selectedRoundObj?.name || (selectedRoundId ? `Round #${selectedRoundId}` : "Not selected")}
                            </span>
                        </div>

                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                Tournament Name
                            </span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block truncate mt-0.5" title={selectedTournamentObj?.name || tournamentName}>
                                {selectedTournamentObj?.name || tournamentName || (selectedTournamentId ? `Tournament #${selectedTournamentId}` : "Not selected")}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
