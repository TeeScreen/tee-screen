"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MapPicker from "./MapPicker";
import { Button } from "@/components/ui/button";

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
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Select Location</DialogTitle>
                    </DialogHeader>

                    <MapPicker
                        start={start}
                        onSelect={(coords) => {
                            onSelect(coords);
                            setOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}