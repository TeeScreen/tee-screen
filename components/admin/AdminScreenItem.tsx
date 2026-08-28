"use client";

import { useEffect, useState } from "react";

export function AdminScreenItem({
                                    screen,
                                }: {
    screen: {
        screenName: string;
        lastLive: string;
        FolderName: string;
    };
}) {
    return (
        <div className="border rounded-lg p-4 flex flex-col gap-4 bg-card/50 shadow-sm">
            {/* Name */}
            <h2 className="text-lg font-semibold text-center">
                {screen.screenName}
            </h2>

            {/* Image */}
            <div className="flex justify-center">
                <div className="relative rounded-md overflow-hidden w-full max-w-[250px]">
                    <div className="aspect-[9/16] w-full">
                        <img
                            src={`/api/preview/${screen.FolderName}` as const}
                            alt={screen.screenName}
                            className="object-cover w-full h-full"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "/placeholder-9x16.png";
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Last Live */}
            <p className="text-sm text-center text-foreground">
                Last Live: {screen.lastLive}
            </p>
        </div>
    );
}
