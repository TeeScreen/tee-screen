"use client";

import { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    ZoomControl,
    useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Globe, Map as MapIcon, Info, Loader2, Plus, Minus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

type MarkerKey =
    | "holePointLatLong"
    | "whiteTeePointLatLong"
    | "yellowTeePointLatLong"
    | "redTeePointLatLong";

type LatLon = { lat: number; lon: number };
type RGBA = { r: number; g: number; b: number; a: number };

export type HoleData = {
    holeNumber: number;
    holePointLatLong: LatLon;
    whiteTeePointLatLong: LatLon;
    yellowTeePointLatLong: LatLon;
    redTeePointLatLong: LatLon;
};

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
    useMapEvents({
        zoom(e) {
            onZoom(e.target.getZoom());
        },
    });
    return null;
}

export default function GlobalCourseMap({
                                            holes,
                                            clubLocation,
                                            onConfirm,
                                            onCancel,
                                            teeSettings
                                        }: {
    holes: HoleData[];
    clubLocation: LatLon;
    onConfirm: (updated: HoleData[]) => Promise<void> | void;
    onCancel: () => void;
    teeSettings: {
        whiteTeeLabel: string;
        yellowTeeLabel: string;
        redTeeLabel: string;

        TeeColourWhite: RGBA;
        TeeColourYellow: RGBA;
        TeeColourRed: RGBA;
    };
}) {
    const [zoom, setZoom] = useState(16);
    const [mapType, setMapType] = useState<"satellite" | "street">("satellite");
    const [infoOpen, setInfoOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [localHoles, setLocalHoles] = useState<HoleData[]>(holes);

    // ⭐ Hole filter state
    const [visibleHoles, setVisibleHoles] = useState<number[]>(holes.map(h => h.holeNumber));

    useEffect(() => {
        setLocalHoles(holes);
        setVisibleHoles(holes.map(h => h.holeNumber));
    }, [holes]);

    const scale = Math.pow(1.15, zoom - 16);

    const makeCircleIcon = (color: string, label: string) =>
        L.divIcon({
            className: "",
            html: `
                <div style="
                    width: 18px;
                    height: 18px;
                    background: ${color};
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 3px rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                    font-weight: 700;
                    color: ${color === "#ffffff" ? "#000" : "#fff"};
                    transform: scale(${scale});
                    transform-origin: center;
                ">
                    ${label}
                </div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
        });

    const makeDiamondIcon = (color: string, label: string) =>
        L.divIcon({
            className: "",
            html: `
                <div style="
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    transform: rotate(45deg) scale(${scale});
                    transform-origin: center;
                    border: 2px solid white;
                    box-shadow: 0 0 3px rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        transform: rotate(-45deg);
                        font-size: 8px;
                        font-weight: 700;
                        color: #fff;
                    ">
                        ${label}
                    </div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

    const satelliteTiles =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const streetTiles =
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const updateMarker = (
        holeNumber: number,
        key: MarkerKey,
        coords: LatLon
    ) => {
        setLocalHoles((prev) =>
            prev.map((h) =>
                h.holeNumber === holeNumber
                    ? { ...h, [key]: coords }
                    : h
            )
        );
    };

    const rgbaToHex = (rgba: RGBA) =>
        `#${[rgba.r, rgba.g, rgba.b]
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("")}`;

    const handleConfirm = async () => {
        setSaving(true);
        await onConfirm(localHoles);
        setSaving(false);
    };

    return (
        <div className="relative w-full h-full">

            {/* ⭐ Vertical Hole Filter Panel */}
            <div className="absolute top-3 left-3 z-[1000] backdrop-blur-md px-3 py-3 rounded shadow flex flex-col gap-2 w-24">

                <Button
                    size="sm"
                    variant={visibleHoles.length === holes.length ? "default" : "outline"}
                    onClick={() => setVisibleHoles(holes.map(h => h.holeNumber))}
                    className="w-full"
                >
                    All
                </Button>

                <Button
                    size="sm"
                    variant={visibleHoles.length === 0 ? "default" : "outline"}
                    onClick={() => setVisibleHoles([])}
                    className="w-full"
                >
                    Hide
                </Button>

                <div className="border-t my-1" />

                {holes.map((h) => (
                    <Button
                        key={h.holeNumber}
                        size="sm"
                        variant={visibleHoles.includes(h.holeNumber) ? "default" : "outline"}
                        onClick={() =>
                            setVisibleHoles(prev =>
                                prev.includes(h.holeNumber)
                                    ? prev.filter(n => n !== h.holeNumber)
                                    : [...prev, h.holeNumber]
                            )
                        }
                        className="w-full"
                    >
                        {h.holeNumber}
                    </Button>
                ))}
            </div>

            {/* Reset All */}
            <div className="absolute top-3 left-32 z-[1000]">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                        setLocalHoles(prev =>
                            prev.map(h => ({
                                ...h,
                                holePointLatLong: { ...clubLocation },
                                whiteTeePointLatLong: { ...clubLocation },
                                yellowTeePointLatLong: { ...clubLocation },
                                redTeePointLatLong: { ...clubLocation },
                            }))
                        );
                    }}
                >
                    Reset All
                </Button>
            </div>

            {/* ⭐ Controls (Top Right) */}
            <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">

                {/* Zoom Out */}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setZoom(z => Math.max(1, z - 1))}
                >
                    <Minus className="h-4 w-4" />
                </Button>

                {/* Zoom In */}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setZoom(z => Math.min(19, z + 1))}
                >
                    <Plus className="h-4 w-4" />
                </Button>

                {/* Satellite / Street */}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() =>
                        setMapType(prev => prev === "satellite" ? "street" : "satellite")
                    }
                >
                    {mapType === "satellite" ? (
                        <MapIcon className="h-4 w-4" />
                    ) : (
                        <Globe className="h-4 w-4" />
                    )}
                </Button>

                {/* Info */}
                <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => setInfoOpen(true)}
                >
                    <Info className="h-4 w-4" />
                </Button>
            </div>

            {/* Info Dialog */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Global Course Map</DialogTitle>
                        <DialogDescription>
                            Drag markers to reposition them.
                            Changes are only saved when you click Confirm.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* ⭐ Legend (shifted right to avoid overlap) */}
            <div
                className="absolute bottom-3 z-[1000] bg-muted shadow-md rounded-md px-3 py-2 text-xs space-y-1"
                style={{ left: "140px" }}
            >
                <p className="font-semibold text-[11px] tracking-tight">Legend</p>

                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#00c853] rotate-45 border border-white" />
                    <span>Hole Center</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: rgbaToHex(teeSettings.TeeColourWhite) }}/>
                    <span>{teeSettings.whiteTeeLabel} Tee</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: rgbaToHex(teeSettings.TeeColourYellow) }}/>
                    <span>{teeSettings.yellowTeeLabel} Tee</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: rgbaToHex(teeSettings.TeeColourRed) }}/>
                    <span>{teeSettings.redTeeLabel} Tee</span>
                </div>
            </div>

            {/* Map */}
            <MapContainer
                center={[clubLocation.lat, clubLocation.lon]}
                zoom={zoom}
                zoomControl={false}
                className="w-full h-full"
            >
                <ZoomWatcher onZoom={setZoom} />

                <TileLayer
                    url={mapType === "satellite" ? satelliteTiles : streetTiles}
                />

                {localHoles
                    .filter(h => visibleHoles.includes(h.holeNumber))
                    .map((hole) => {
                        const holeNum = hole.holeNumber;

                        const markers = [
                            {
                                key: "holePointLatLong" as MarkerKey,
                                coords: hole.holePointLatLong,
                                icon: makeDiamondIcon("#00c853", String(holeNum)),
                            },
                            {
                                key: "whiteTeePointLatLong" as MarkerKey,
                                coords: hole.whiteTeePointLatLong,
                                icon: makeCircleIcon(rgbaToHex(teeSettings.TeeColourWhite), `${holeNum}`),
                            },
                            {
                                key: "yellowTeePointLatLong" as MarkerKey,
                                coords: hole.yellowTeePointLatLong,
                                icon: makeCircleIcon(rgbaToHex(teeSettings.TeeColourYellow), `${holeNum}`),
                            },
                            {
                                key: "redTeePointLatLong" as MarkerKey,
                                coords: hole.redTeePointLatLong,
                                icon: makeCircleIcon(rgbaToHex(teeSettings.TeeColourRed), `${holeNum}`),
                            },
                        ];

                        return markers.map(({ key, coords, icon }) => (
                            <Marker
                                key={`${holeNum}-${key}`}
                                position={[coords.lat, coords.lon]}
                                icon={icon}
                                draggable
                                eventHandlers={{
                                    dragend: (e) => {
                                        const latlng = e.target.getLatLng();
                                        updateMarker(holeNum, key, {
                                            lat: latlng.lat,
                                            lon: latlng.lng,
                                        });
                                    },
                                }}
                            />
                        ));
                    })}
            </MapContainer>

            {/* Footer */}
            <div className="absolute bottom-3 right-3 z-[1000] flex gap-3">
                <Button variant="secondary" onClick={onCancel} disabled={saving}>
                    Cancel
                </Button>

                <Button onClick={handleConfirm} disabled={saving}>
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Confirm Changes"
                    )}
                </Button>
            </div>
        </div>
    );
}
