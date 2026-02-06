"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = L.icon({
    iconUrl: "/assets/icons/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export default function MapPicker({
                                      start,
                                      onSelect,
                                  }: {
    start: { lat: number; lon: number };
    onSelect: (coords: { lat: number; lon: number }) => void;
}) {
    function ClickHandler() {
        useMapEvents({
            click(e) {
                onSelect({ lat: e.latlng.lat, lon: e.latlng.lng });
            },
        });
        return null;
    }

    return (
        <MapContainer
            center={[start.lat, start.lon]}
            zoom={16}
            style={{ height: "400px", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[start.lat, start.lon]} icon={markerIcon} />
            <ClickHandler />
        </MapContainer>
    );
}