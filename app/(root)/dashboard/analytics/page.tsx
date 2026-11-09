import React from "react";
import { getUserInfo } from "@/lib/actions/user.actions";
import dynamicImport from "next/dynamic";

const AnalyticsPageClient = dynamicImport(
    () => import("@/components/analytics/AnalyticsPageClient"),
    {
        loading: () => (
            <div className="p-8 border rounded-2xl bg-card text-center text-muted-foreground animate-pulse">
                Loading analytics dashboard…
            </div>
        ),
    }
);

export const dynamic = "force-dynamic";

export default async function Page() {
    let user: any = {};
    try {
        user = await getUserInfo();
    } catch (e) {
        console.warn("Failed to fetch user info", e);
    }

    const screenNames: string[] = user?.screenNames ?? [];
    const loadedScreen: string | null = user?.loadedScreen || null;
    const loadedAccount: string | null = user?.loadedAccount || null;

    // Pre-fetch analytics for the currently loaded screen (if any)
    let initialData: { screenName: string; interactions: any[] } | null = null;
    if (loadedScreen && user?.analyticsJson) {
        initialData = {
            screenName: loadedScreen,
            interactions: Array.isArray(user.analyticsJson)
                ? user.analyticsJson
                : (user.analyticsJson?.interactions ?? []),
        };
    }

    return (
        <AnalyticsPageClient
            screenNames={screenNames}
            loadedScreen={loadedScreen}
            initialData={initialData}
        />
    );
}