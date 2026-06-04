"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Monitor, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScreenList } from "./ScreenList";
import { ResetLoadedDataDialog } from "@/components/ResetData";
import Link from "next/link";

export function ScreenSelector({
    screens,
    loadedScreen,
    onLoadScreen,
    onResetScreen,
}: {
    screens: string[];
    loadedScreen: string | null;
    onLoadScreen: (screenName: string) => void;
    onResetScreen: () => Promise<void>;
}) {
    const [isExpanded, setIsExpanded] = useState(!loadedScreen);

    // If there are no screens, show nothing or a small message
    if (screens.length === 0) {
        return (
            <div className="p-4 border border-dashed rounded-xl text-center text-muted-foreground text-sm bg-card">
                No screens found for this account.
            </div>
        );
    }

    const hasMultipleScreens = screens.length > 1;

    // 1. Single screen scenario
    if (!hasMultipleScreens) {
        const singleScreen = screens[0];

        // If the single screen is already loaded, render the card without change options
        if (loadedScreen === singleScreen) {
            return (
                <div className="flex flex-col gap-4">
                    <div className="p-5 border rounded-2xl bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 rounded-xl bg-primary/10 text-primary">
                                <Monitor className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your screen</p>
                                <h4 className="text-lg font-bold mt-0.5">{loadedScreen}</h4>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>Showing now • updated recently</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ResetLoadedDataDialog action={onResetScreen} hasMultipleScreens={false} />
                            <Button asChild className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90">
                                <Link href="/dashboard/golf-course">
                                    <Edit className="h-4 w-4" /> Open &amp; edit
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        // Otherwise, show a button to load the screen
        return (
            <div className="p-5 border rounded-2xl bg-card shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Monitor className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold">TeeScreen Display Ready</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Connect to screen &quot;{singleScreen}&quot; to manage content and layouts.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => onLoadScreen(singleScreen)}
                    className="w-full sm:w-auto inline-flex items-center gap-2"
                >
                    Load Screen <Edit className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    // 2. Multiple screens scenario
    return (
        <div className="w-full flex flex-col gap-4">
            {loadedScreen ? (
                <div className="flex flex-col gap-4">
                    {/* Header bar */}
                    <div className="p-5 border rounded-2xl bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="p-3.5 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                                <Monitor className="h-6 w-6" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Your screen</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <h4 className="text-lg font-bold truncate">{loadedScreen}</h4>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>Showing now • updated recently</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            <ResetLoadedDataDialog action={onResetScreen} hasMultipleScreens={true} />

                            {/* "Open & edit" toggles the screen list dropdown */}
                            <Button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90"
                            >
                                <Edit className="h-4 w-4" />
                                Open &amp; edit
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Collapsible Screen List */}
                    {isExpanded && (
                        <div className="p-5 border border-dashed rounded-2xl bg-muted/10 animate-in slide-in-from-top-3 duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-muted-foreground">
                                    Choose a screen to open &amp; edit
                                </h3>
                                <Button
                                    asChild
                                    size="sm"
                                    variant="ghost"
                                    className="text-primary hover:text-primary/80 gap-1.5"
                                >
                                    <Link href="/dashboard/golf-course">
                                        <Edit className="h-3.5 w-3.5" />
                                        Edit current
                                    </Link>
                                </Button>
                            </div>
                            <ScreenList
                                screens={screens}
                                loadedScreen={loadedScreen}
                                onLoadScreen={(name) => {
                                    onLoadScreen(name);
                                    setIsExpanded(false); // Collapse after load
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : (
                // If no screen is loaded, force showing the selection list
                <div className="p-5 border rounded-2xl bg-card shadow-sm flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Monitor className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold">Select Screen to Edit</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Select a screen from your connected account to start managing content.
                            </p>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-muted/60">
                        <ScreenList
                            screens={screens}
                            loadedScreen={loadedScreen}
                            onLoadScreen={onLoadScreen}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
