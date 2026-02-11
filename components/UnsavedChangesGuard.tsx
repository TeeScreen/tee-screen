"use client";

import { useEffect } from "react";
import { useDirtyState } from "@/stores/user-store";

export function UnsavedChangesGuard() {
    const { dirty } = useDirtyState();

    useEffect(() => {
        if (!dirty) return;

        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ""; // Required for Chrome
        };

        window.addEventListener("beforeunload", handler);

        return () => {
            window.removeEventListener("beforeunload", handler);
        };
    }, [dirty]);

    return null;
}