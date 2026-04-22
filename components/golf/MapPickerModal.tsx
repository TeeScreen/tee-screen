"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MarkerKey =
    | "holePointLatLong"
    | "whiteTeePointLatLong"
    | "yellowTeePointLatLong"
    | "redTeePointLatLong";

type LatLon = { lat: number; lon: number };
type RGBA = { r: number; g: number; b: number; a: number };

const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => <div className="p-6">Loading map…</div>,
});

export default function MapPickerModal({
                                           points,
                                           clubLocation,
                                           holeNumber,
                                           teeLabels,
                                           teeColours,
                                           onSelect,
                                       }: {
    points: Record<MarkerKey, LatLon>;
    clubLocation: LatLon;
    holeNumber: number;

    // NEW
    teeLabels: Record<MarkerKey, string>;
    teeColours: Record<MarkerKey, RGBA>;

    onSelect: (updated: Record<MarkerKey, LatLon>) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Pick on Map
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[900px] w-full max-w-none">
                    <DialogHeader className="p-4">
                        <DialogTitle>Hole {holeNumber} — Set Coordinates</DialogTitle>
                    </DialogHeader>

                    <div className="p-6">
                        <MapPicker
                            points={points}
                            clubLocation={clubLocation}
                            holeNumber={holeNumber}

                            // NEW — dynamic labels + colours
                            teeLabels={teeLabels}
                            teeColours={teeColours}

                            onConfirm={(updated) => {
                                onSelect(updated);
                                setOpen(false);
                            }}
                            onCancel={() => setOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
