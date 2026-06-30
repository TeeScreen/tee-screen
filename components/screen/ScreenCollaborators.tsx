"use client";

import React, { useEffect, useRef, useState } from "react";
import { getScreenStatus } from "@/lib/actions/user.actions";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDirtyState } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";

interface ActiveUser {
    userId: string;
    fullName: string;
    role: string;
    isCurrent: boolean;
}

interface ScreenStatus {
    lastEdited: string | null;
    lastEditedBy: string | null;
    lastEditedByName: string | null;
    activeUsers: ActiveUser[];
}

export function ScreenCollaborators({
    screenName,
    accountLogin,
}: {
    screenName: string;
    accountLogin: string;
}) {
    const [status, setStatus] = useState<ScreenStatus | null>(null);
    // Track the last seen lastEdited + lastEditedBy to detect external changes
    const prevLastEdited = useRef<string | null>(null);
    const prevLastEditedBy = useRef<string | null>(null);

    const { bumpExternalVersion } = useDirtyState(
        useShallow((s) => ({ bumpExternalVersion: s.bumpExternalVersion }))
    );

    useEffect(() => {
        if (!screenName) return;

        let isMounted = true;

        async function refreshStatus() {
            const res = await getScreenStatus(screenName);
            if (!res || !isMounted) return;

            const newEdited = res.lastEdited;
            const newByName = res.lastEditedByName;
            const prevEdited = prevLastEdited.current;

            const isExternalEdit =
                newEdited &&
                newEdited !== prevEdited &&
                newByName &&
                !res.activeUsers.find((u) => u.isCurrent && u.fullName === newByName);

            if (isExternalEdit) bumpExternalVersion();

            prevLastEdited.current = newEdited;
            prevLastEditedBy.current = newByName;

            setStatus(res);
        }

        const handler = () => refreshStatus();
        window.addEventListener("screen-updated", handler);

        refreshStatus();

        return () => {
            isMounted = false;
            window.removeEventListener("screen-updated", handler);
        };
    }, [screenName, accountLogin, bumpExternalVersion]);

    if (!status) return null;

    const otherUsers = status.activeUsers.filter((u) => !u.isCurrent);
    const activeCount = status.activeUsers.length;

    // Relative time helper
    function getRelativeTime(dateStr: string | null) {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    }

    // Get initials for Avatar Fallback
    function getInitials(name: string) {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase() || "?";
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-full border bg-card/60 backdrop-blur-md shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-300 group cursor-pointer",
                        activeCount > 1 && "border-primary/30"
                    )}
                >
                    {/* Pulsing indicator dot */}
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>

                    {/* Overlapping Avatar Stack */}
                    <div className="flex -space-x-2.5 overflow-hidden">
                        {status.activeUsers.slice(0, 3).map((user) => (
                            <Avatar
                                key={user.userId}
                                className={cn(
                                    "h-5 w-5 border-2 border-background ring-1 ring-border shadow-sm text-[9px] font-bold select-none",
                                    user.isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}
                            >
                                <AvatarFallback className="bg-inherit text-inherit">
                                    {getInitials(user.fullName)}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                        {activeCount > 3 && (
                            <div className="flex items-center justify-center h-5 w-5 rounded-full border-2 border-background bg-muted text-[8px] font-bold text-muted-foreground ring-1 ring-border">
                                +{activeCount - 3}
                            </div>
                        )}
                    </div>

                    {/* Summary text */}
                    <span className="text-[11px] font-medium tracking-tight text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                        {activeCount === 1 ? (
                            <span>Editing alone</span>
                        ) : (
                            <span>{activeCount} active editors</span>
                        )}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-80 p-4 rounded-2xl bg-card/95 backdrop-blur-md border shadow-lg flex flex-col gap-4 z-50">
                {/* Active Users Section */}
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>Active Users</span>
                    </div>

                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                        {status.activeUsers.map((user) => (
                            <div
                                key={user.userId}
                                className="flex items-center justify-between p-2 rounded-xl bg-accent/30 border border-transparent hover:border-border transition-all duration-200"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <Avatar className="h-7 w-7 text-xs font-bold bg-primary/10 text-primary">
                                        <AvatarFallback>
                                            {getInitials(user.fullName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="text-xs font-bold truncate">
                                            {user.fullName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {user.isCurrent ? (
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] font-bold px-1.5 py-0 bg-primary/10 text-primary border-none"
                                        >
                                            You
                                        </Badge>
                                    ) : (
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-border/60" />

                {/* Last Edit Section */}
                <div className="flex flex-col gap-2 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Last Edit</span>
                    </div>

                    {status.lastEdited ? (
                        <div className="p-2.5 rounded-xl bg-accent/35 border text-xs flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 font-medium">
                                <Edit3 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <span>{getRelativeTime(status.lastEdited)}</span>
                            </div>
                            <span className="text-muted-foreground text-[11px] leading-relaxed">
                                Changed by <span className="font-bold text-foreground">{status.lastEditedByName}</span>
                            </span>
                        </div>
                    ) : (
                        <div className="p-2.5 rounded-xl bg-accent/35 border text-xs text-muted-foreground text-center py-4 italic">
                            No pending changes made yet
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
