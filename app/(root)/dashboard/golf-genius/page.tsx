import React from "react";
import { getUserInfo } from "@/lib/actions/user.actions";
import { Trophy, AlertTriangle, Monitor } from "lucide-react";
import GolfGeniusManager from "@/components/golf/GolfGeniusManager";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Page() {
    let user: any = {};
    try {
        user = await getUserInfo();
    } catch (e) {
        console.warn("Failed to fetch user info for Golf Genius page", e);
    }

    const loadedScreen = user?.loadedScreen ?? "";
    const screenJson = user?.screenJson ?? null;
    const isGolfClub = Boolean(screenJson?.isGolfClub);
    const hasApiKey = Boolean(screenJson?.golfgenius_api_key && String(screenJson?.golfgenius_api_key).trim() !== "");

    return (
        <div className="space-y-6">
            <h1 className="h-12 flex flex-row items-center gap-3 text-2xl font-bold">
                <Trophy className="h-7 w-7 text-emerald-600" />
                <span>Golf Genius</span>
            </h1>

            {!loadedScreen || !screenJson ? (
                <Card className="border-dashed p-8 text-center space-y-4">
                    <div className="flex justify-center">
                        <Monitor className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">No Active Screen Loaded</CardTitle>
                        <CardDescription>
                            Please select and load a golf club screen from the Screens page to manage Golf Genius tournament settings.
                        </CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/home">Go to Screens</Link>
                    </Button>
                </Card>
            ) : !isGolfClub ? (
                <Card className="border-amber-500/30 bg-amber-500/5 p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                            <CardTitle className="text-base text-amber-700 dark:text-amber-400">
                                Selected Screen is Not a Golf Club
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Golf Genius tournament integration is available for golf club screens. Screen &quot;{loadedScreen}&quot; is not set up as a golf club screen.
                            </CardDescription>
                            <Button asChild variant="outline" size="sm" className="mt-2 text-xs">
                                <Link href="/dashboard/home">Switch Screen</Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <GolfGeniusManager screenName={loadedScreen} screenJson={screenJson} />
            )}
        </div>
    );
}
