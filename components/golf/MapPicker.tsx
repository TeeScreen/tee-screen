"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    ZoomControl,
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
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, Globe, Map as MapIcon } from "lucide-react";

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
    const [mapType, setMapType] = useState<"satellite" | "street">("satellite");

    const markerIcon = useMemo(
        () =>
            L.icon({
                iconUrl: "/assets/icons/target.svg",
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            }),
        []
    );

    function FlyTo({ coords }: { coords: [number, number] }) {
        const map = useMap();
        const firstRender = useRef(true);

        useEffect(() => {
            if (firstRender.current) {
                firstRender.current = false;
                return;
            }
            map.flyTo(coords, map.getZoom(), { duration: 0.6 });
        }, [coords, map]);

        return null;
    }

    function ClickHandler() {
        useMapEvents({
            click(e) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            },
        });
        return null;
    }

    const onDragEnd = useCallback((e: any) => {
        const latlng = e.target.getLatLng();
        setPosition([latlng.lat, latlng.lng]);
    }, []);

    const satelliteTiles =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const streetTiles =
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    return (
        <div className="relative w-full h-[70vh] flex flex-col gap-3">

            {/* Top-right controls */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">

                {/* Map type toggle */}
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow"
                    onClick={() =>
                        setMapType((prev) =>
                            prev === "satellite" ? "street" : "satellite"
                        )
                    }
                >
                    {mapType === "satellite" ? (
                        <MapIcon className="h-4 w-4" />
                    ) : (
                        <Globe className="h-4 w-4" />
                    )}
                </Button>

                {/* Info button (manual trigger) */}
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow"
                    onClick={() => setInfoOpen(true)}
                >
                    <Info className="h-4 w-4" />
                </Button>
            </div>

            {/* Info Dialog (no DialogTrigger) */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>How to Use the Map</DialogTitle>
                        <DialogDescription>
                            Click anywhere on the map to move the marker, or drag it to fine‑tune the position.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Map */}
            <div className="flex-1 min-h-[300px]">
                <MapContainer
                    center={[start.lat, start.lon]}
                    zoom={16}
                    zoomControl={false}
                    className="w-full h-full rounded-md"
                >
                    <ZoomControl position="bottomright" />

                    <TileLayer
                        url={mapType === "satellite" ? satelliteTiles : streetTiles}
                        attribution={
                            mapType === "satellite"
                                ? "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
                                : "© OpenStreetMap contributors"
                        }
                    />

                    <Marker
                        position={position}
                        icon={markerIcon}
                        draggable
                        eventHandlers={{ dragend: onDragEnd }}
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