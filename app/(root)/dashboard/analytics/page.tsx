import React from "react";
import { PanelTopBottomDashed } from "lucide-react";
import { getUserInfo } from "@/lib/actions/user.actions";
import InteractionsDashboard from "@/components/InteractionDashboard";

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