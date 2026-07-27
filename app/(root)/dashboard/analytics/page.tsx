import React from "react";
import { PanelTopBottomDashed } from "lucide-react";
import { getUserInfo } from "@/lib/actions/user.actions";
import dynamicImport from "next/dynamic";

const InteractionsDashboard = dynamicImport(
    () => import("@/components/InteractionDashboard"),
    {
        loading: () => (
            <div className="p-8 border rounded-2xl bg-card text-center text-muted-foreground animate-pulse">
                Loading analytics dashboard...
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
        console.warn('Failed to fetch user info', e);
    }
    const analyticsJson = user?.analyticsJson;

    // Pull interactions instead of check-ins
    const interactions = analyticsJson?.interactions ?? [];

    return (
        <div className="p-4">
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <PanelTopBottomDashed /> Interactions
            </h1>

            <InteractionsDashboard interactions={interactions} />
        </div>
    );
}