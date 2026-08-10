"use client";

import {useEffect, useState} from "react";
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
import { RotateCcw, Info, Globe, Map as MapIcon } from "lucide-react";
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

function ZoomWatcher({ onZoom }: { onZoom: (z: number) => void }) {
    useMapEvents({
        zoom(e) {
            onZoom(e.target.getZoom());
        },
    });
    return null;
}

export default function MapPicker({
                                      points,
                                      clubLocation,
                                      holeNumber,
                                      onConfirm,
                                      onCancel,
                                      teeLabels,
                                      teeColours,
                                  }: {
    points: Record<MarkerKey, LatLon>;
    clubLocation: LatLon;
    holeNumber: number;
    onConfirm: (updated: Record<MarkerKey, LatLon>) => void;
    onCancel: () => void;
    teeLabels: Record<MarkerKey, string>;
    teeColours: Record<MarkerKey, RGBA>;
}) {
    const [positions, setPositions] = useState(points);
    const [mapType, setMapType] = useState<"satellite" | "street">("satellite");
    const [infoOpen, setInfoOpen] = useState(false);
    const [zoom, setZoom] = useState(16);

    // Smooth proportional scaling relative to zoom
    // 16 = baseline size
    const scale = Math.pow(1.15, zoom - 16);

    useEffect(() => {
        const close = () => closeMenu();
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);


    // Tee markers (circles)
    const makeCircleIcon = (color: string, label: string) =>
        L.divIcon({
            className: "",
            html: `
                <div style="
                    width: 20px;
                    height: 20px;
                    background: ${color};
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 3px rgba(0,0,0,0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 9px;
                    font-weight: 700;
                    color: ${color === "#ffffff" ? "#000" : "#fff"};
                    transform: scale(${scale});
                    transform-origin: center;
                ">
                    ${label}
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
        });

    // Hole marker (diamond)
    const makeDiamondIcon = (color: string, label: string) =>
        L.divIcon({
            className: "",
            html: `
                <div style="
                    width: 22px;
                    height: 22px;
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
                        font-size: 9px;
                        font-weight: 700;
                        color: ${color === "#ffffff" ? "#000" : "#fff"};
                    ">
                        ${label}
                    </div>
                </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
        });

    const rgbaToHex = (rgba: RGBA) =>
        `#${[rgba.r, rgba.g, rgba.b]
            .map((v) => v.toString(16).padStart(2, "0"))
            .join("")}`;
    const markerIcons: Record<MarkerKey, L.DivIcon> = {
        holePointLatLong: makeDiamondIcon("#00c853", String(holeNumber)),
        whiteTeePointLatLong: makeCircleIcon(rgbaToHex(teeColours.whiteTeePointLatLong), String(holeNumber)),
        yellowTeePointLatLong: makeCircleIcon(rgbaToHex(teeColours.yellowTeePointLatLong), String(holeNumber)),
        redTeePointLatLong: makeCircleIcon(rgbaToHex(teeColours.redTeePointLatLong), String(holeNumber)),
    };

    const handleDragEnd = (key: MarkerKey) => (e: any) => {
        const latlng = e.target.getLatLng();
        setPositions((prev) => ({
            ...prev,
            [key]: { lat: latlng.lat, lon: latlng.lng },
        }));
    };

    const resetAll = () => {
        setPositions({
            holePointLatLong: { ...clubLocation },
            whiteTeePointLatLong: { ...clubLocation },
            yellowTeePointLatLong: { ...clubLocation },
            redTeePointLatLong: { ...clubLocation },
        });
    };

    const [contextMenu, setContextMenu] = useState<{
        lat: number;
        lon: number;
        x: number;
        y: number;
        open: boolean;
    }>({
        lat: 0,
        lon: 0,
        x: 0,
        y: 0,
        open: false,
    });


    function RightClickListener({
                                    onOpen,
                                }: {
        onOpen: (lat: number, lon: number, x: number, y: number) => void;
    }) {
        useMapEvents({
            contextmenu(e) {
                const map = e.target._container;
                const rect = map.getBoundingClientRect();

                const x = e.originalEvent.clientX - rect.left;
                const y = e.originalEvent.clientY - rect.top;

                onOpen(e.latlng.lat, e.latlng.lng, x, y);
            },
        });
        return null;
    }


    const placeAll = () => {
        setPositions({
            holePointLatLong: { lat: contextMenu.lat, lon: contextMenu.lon },
            whiteTeePointLatLong: { lat: contextMenu.lat, lon: contextMenu.lon },
            yellowTeePointLatLong: { lat: contextMenu.lat, lon: contextMenu.lon },
            redTeePointLatLong: { lat: contextMenu.lat, lon: contextMenu.lon },
        });
        closeMenu();
    };

    const placeOne = (key: MarkerKey) => {
        setPositions(prev => ({
            ...prev,
            [key]: { lat: contextMenu.lat, lon: contextMenu.lon },
        }));
        closeMenu();
    };

    const closeMenu = () =>
        setContextMenu(prev => ({ ...prev, open: false }));


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

                {/* Info button */}
                <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full shadow"
                    onClick={() => setInfoOpen(true)}
                >
                    <Info className="h-4 w-4" />
                </Button>
            </div>

            {/* Info Dialog */}
            <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>How to Use the Map</DialogTitle>
                        <DialogDescription>
                            Drag markers to adjust positions.
                            Markers shrink as you zoom out.
                            Hole marker is a diamond shape.
                            Tees are circles labeled W/Y/R + hole number.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            {/* Reset button */}
            <div className="absolute top-3 left-3 z-[1000]">
                <Button
                    size="sm"
                    variant="secondary"
                    className="shadow"
                    onClick={resetAll}
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All to Club Location
                </Button>
            </div>

            {/* Legend overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] shadow-md rounded-md px-3 py-2 bg-muted text-xs space-y-1">
                <p className="font-semibold text-[11px] tracking-tight">Legend</p>

                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#00c853] rotate-45 border border-white" />
                    <span>Hole {holeNumber} Center</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: rgbaToHex(teeColours.whiteTeePointLatLong) }}/>
                    <span>{teeLabels.whiteTeePointLatLong} Tee ({holeNumber})</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: rgbaToHex(teeColours.yellowTeePointLatLong) }}/>
                    <span>{teeLabels.yellowTeePointLatLong} Tee ({holeNumber})</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: rgbaToHex(teeColours.redTeePointLatLong) }}/>
                    <span>{teeLabels.redTeePointLatLong} Tee ({holeNumber})</span>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 min-h-[300px]">
                <MapContainer
                    center={[points["holePointLatLong"].lat, points["holePointLatLong"].lon]}
                    zoom={16}
                    zoomControl={false}
                    className="w-full h-full rounded-md"
                >
                    {contextMenu.open && (
                        <div
                            className="absolute z-[2000] bg-popover border rounded-md shadow-md text-sm"
                            style={{
                                top: contextMenu.y,
                                left: contextMenu.x,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="font-semibold mb-2">Place markers here</p>

                            <button
                                className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                                onClick={placeAll}
                            >
                                Place All
                            </button>

                            <button
                                className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                                onClick={() => placeOne("holePointLatLong")}
                            >
                                Place Hole Marker
                            </button>

                            <button
                                className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                                onClick={() => placeOne("whiteTeePointLatLong")}
                            >
                                Place White Tee
                            </button>

                            <button
                                className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                                onClick={() => placeOne("yellowTeePointLatLong")}
                            >
                                Place Yellow Tee
                            </button>

                            <button
                                className="w-full text-left px-2 py-1 hover:bg-muted rounded"
                                onClick={() => placeOne("redTeePointLatLong")}
                            >
                                Place Red Tee
                            </button>
                        </div>
                    )}
                    <ZoomControl position="bottomright" />

                    <ZoomWatcher onZoom={setZoom} />
                    <RightClickListener
                        onOpen={(lat, lon, x, y) =>
                            setContextMenu({ lat, lon, x, y, open: true })
                        }
                    />


                    <TileLayer
                        url={mapType === "satellite" ? satelliteTiles : streetTiles}
                        attribution={
                            mapType === "satellite"
                                ? "Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
                                : "© OpenStreetMap contributors"
                        }
                    />

                    {(Object.keys(positions) as MarkerKey[]).map((key) => (
                        <Marker
                            key={key}
                            position={[positions[key].lat, positions[key].lon]}
                            icon={markerIcons[key]}
                            draggable
                            eventHandlers={{ dragend: handleDragEnd(key) }}
                        />
                    ))}
                </MapContainer>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-2">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={() => onConfirm(positions)}>
                    Confirm All
                </Button>
            </div>

        </div>
    );
}
