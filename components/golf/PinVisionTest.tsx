'use client';

import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMap, GeoJSON as LeafletGeoJSON, PathOptions, CircleMarkerOptions } from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';

interface StyleConfig {
    [key: string]: PathOptions;
}

const STYLES: StyleConfig = {
    green: { color: '#000000', weight: 0.5, fillColor: '#bbe999', fillOpacity: 1 },
    fairway: { color: '#000000', weight: 0.5, fillColor: '#8ace5e', fillOpacity: 1 },
    teebox: { color: '#000000', weight: 0.5, fillColor: '#8ace5e', fillOpacity: 1 },
    bunker: { color: '#000000', weight: 0.5, fillColor: '#f8efc6', fillOpacity: 1 },
    water: { color: 'rgba(0,0,0,0)', weight: 1, fillColor: '#99ddff', fillOpacity: 1 },
    path: { color: '#ffffff', weight: 1, fillOpacity: 0 },
    hole: { color: 'rgba(0,0,0,0.3)', weight: 1, fillColor: '#ffffff', fillOpacity: 0 },
};

const DEFAULT_STYLE: PathOptions = { color: '#475569', weight: 1, fillOpacity: 0 };

// Module-level cache to persist GeoJSON across component mounts and prevent re-fetching
let cachedGeoJsonData: GeoJsonObject | null = null;

export default function PinVisionMap() {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const dataLayerRef = useRef<LeafletGeoJSON | null>(null);

    useEffect(() => {
        async function initMap() {
            const L = (await import('leaflet')).default;

            if (!mapContainerRef.current || mapRef.current) return;

            const map = L.map(mapContainerRef.current, {
                zoomControl: true,
                scrollWheelZoom: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 22,
                opacity: 0.5,
                attribution:
                    '&copy; <a href="https://www.pinvision.io">Pin Vision</a> &nbsp;|&nbsp; &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            mapRef.current = map;

            const getStyle = (feature?: Feature): PathOptions => {
                const type = feature?.properties?.type;
                return type ? STYLES[type] || DEFAULT_STYLE : DEFAULT_STYLE;
            };

            const pointToLayer = (feature: Feature, latlng: L.LatLng) => {
                const type = feature?.properties?.type;
                const isCenter = type === 'teeboxcenter' || type === 'greencenter';
                const markerOptions: CircleMarkerOptions = {
                    radius: isCenter ? 5 : 3,
                    color: isCenter ? '#0f172a' : '#334155',
                    weight: 1.5,
                    fillColor: isCenter ? '#ffffff' : '#cbd5e1',
                    fillOpacity: 1,
                };
                return L.circleMarker(latlng, markerOptions);
            };

            const renderGeoJSON = (geojson: GeoJsonObject) => {
                if (!mapRef.current) return;

                if (dataLayerRef.current) {
                    mapRef.current.removeLayer(dataLayerRef.current);
                }

                const dataLayer = L.geoJSON(geojson, {
                    style: getStyle,
                    pointToLayer: pointToLayer,
                }).addTo(mapRef.current);

                dataLayerRef.current = dataLayer;

                const bounds = dataLayer.getBounds();
                if (bounds.isValid()) {
                    mapRef.current.fitBounds(bounds.pad(0.12));
                } else {
                    mapRef.current.setView([0, 0], 2);
                }
            };

            // Use cached data if available
            if (cachedGeoJsonData) {
                renderGeoJSON(cachedGeoJsonData);
                return;
            }

            // Fetch data and cache it
            try {
                const response = await fetch('https://partner.pinvision.app/v1/club/2283/geojson', {
                    headers: {
                        'x-partner-key': '416aaf8e2778b61f442f23bdac14e62794bebea6',
                    },
                });
                const resData = await response.json();
                const geojsonRes = await fetch(resData.data.url);
                const geojson = await geojsonRes.json();

                cachedGeoJsonData = geojson;
                renderGeoJSON(geojson);
            } catch (err) {
                console.error('Failed to load GeoJSON:', err);
            }
        }

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-800 font-sans">
            <header className="p-3 px-5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-sm font-semibold text-slate-900 whitespace-nowrap">
                    Pin Vision Map Visualizer
                </h1>

                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#8ace5e] border border-black/15" />
                        Fairway / Teebox
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#bbe999] border border-black/15" />
                        Green
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#f8efc6] border border-black/15" />
                        Bunker
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-[#99ddff] border border-black/15" />
                        Water
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3.5 h-3.5 rounded bg-black/15 border border-black/30" />
                        Hole
                    </div>
                </div>
            </header>

            <div ref={mapContainerRef} className="flex-1 w-full h-full z-0" />
        </div>
    );
}