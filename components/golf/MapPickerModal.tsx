"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// MUST be dynamic — React‑Leaflet cannot run on the server
const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => <div className="p-6">Loading map…</div>,
});

export default function MapPickerModal({
                                           start,
                                           onSelect,
                                       }: {
    start: { lat: number; lon: number };
    onSelect: (coords: { lat: number; lon: number }) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Pick on Map
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[800px] w-full max-w-none">
                    <DialogHeader className="p-4">
                        <DialogTitle>Select Location</DialogTitle>
                    </DialogHeader>

                    <div className="p=6">
                        <MapPicker
                            start={start}
                            onConfirm={(coords) => {
                                onSelect(coords);
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