"use client";

import { useState, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const markerIcon = L.icon({
    iconUrl: "/assets/icons/target.svg",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

export default function MapPicker({
                                      start,
                                      onConfirm,
                                      onCancel,
                                  }: {
    start: { lat: number; lon: number };
    onConfirm: (coords: { lat: number; lon: number }) => void;
    onCancel: () => void;
}) {
    const [position, setPosition] = useState<[number, number]>([
        start.lat,
        start.lon,
    ]);

    const [infoOpen, setInfoOpen] = useState(false);

    function FlyTo({ coords }: { coords: [number, number] }) {
        const map = useMap();
        map.flyTo(coords, map.getZoom(), { duration: 0.6 });
        return null;
    }

    function ClickHandler() {
        const map = useMapEvents({
            click(e) {
                const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
                setPosition(newPos);
                map.flyTo(newPos, map.getZoom(), { duration: 0.6 });
            },
        });
        return null;
    }

    const eventHandlers = useMemo(
        () => ({
            dragend(e: any) {
                const marker = e.target;
                const latlng = marker.getLatLng();
                const newPos: [number, number] = [latlng.lat, latlng.lng];
                setPosition(newPos);
            },
        }),
        []
    );

    return (
        <div className="relative w-full h-full flex flex-col gap-3">

            {/* Info Button */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 z-[1000] rounded-full shadow"
                    >
                        <Info className="h-4 w-4" />
                    </Button>
                </DialogTrigger>

                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>How to Use the Map</DialogTitle>
                    </DialogHeader>

                    <div className="text-sm space-y-2">
                        <p className="font-medium">Controls</p>
                        <ul className="list-disc ml-4 text-xs space-y-1">
                            <li>Click anywhere on the map to move the marker</li>
                            <li>Drag the marker to fine‑tune the position</li>
                            <li>Confirm when you're happy with the location</li>
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Map */}
            <div className="flex-1 min-h-[300px]">
                <MapContainer
                    center={[start.lat, start.lon]}
                    zoom={16}
                    className="w-full h-full rounded-md"
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <Marker
                        position={position}
                        icon={markerIcon}
                        draggable={true}
                        eventHandlers={eventHandlers}
                    />

                    <ClickHandler />
                    <FlyTo coords={position} />
                </MapContainer>
            </div>

            {/* Coordinate preview */}
            <div className="absolute bottom-3 left-3 z-[1000] shadow-md rounded-md px-4 py-2 bg-muted text-xs">
                <p className="font-medium">Selected Coordinates</p>
                <p>
                    Lat: {position[0].toFixed(6)}
                    <br />
                    Lon: {position[1].toFixed(6)}
                </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-2">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>

                <Button
                    onClick={() =>
                        onConfirm({ lat: position[0], lon: position[1] })
                    }
                >
                    Confirm Location
                </Button>
            </div>
        </div>
    );
}