"use client";

import { useEffect, useRef, useState } from "react";
import L, { GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";

type GeoJSONData = GeoJSON.FeatureCollection;

const STYLE = {
  green: {
    color: "#000000",
    weight: 0.5,
    fillColor: "#bbe999",
    fillOpacity: 1,
  },
  fairway: {
    color: "#000000",
    weight: 0.5,
    fillColor: "#8ace5e",
    fillOpacity: 1,
  },
  teebox: {
    color: "#000000",
    weight: 0.5,
    fillColor: "#8ace5e",
    fillOpacity: 1,
  },
  bunker: {
    color: "#000000",
    weight: 0.5,
    fillColor: "#f8efc6",
    fillOpacity: 1,
  },
  water: {
    color: "rgba(0,0,0,0)",
    weight: 1,
    fillColor: "#99ddff",
    fillOpacity: 1,
  },
  path: {
    color: "#ffffff",
    weight: 1,
    fillOpacity: 0,
  },
  hole: {
    color: "rgba(0,0,0,0.3)",
    weight: 1,
    fillColor: "#ffffff",
    fillOpacity: 0,
  },
};

const DEFAULT_STYLE = {
  color: "#475569",
  weight: 1,
  fillOpacity: 0.18,
};

export default function GolfCourseMap() {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<LeafletGeoJSON | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState(
    "Showing sample data — load your own GeoJSON file above"
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });

    map.setView([0, 0], 2);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 22,
        opacity: 0.5,
        attribution:
          '&copy; <a href="https://www.pinvision.io">Pin Vision</a> | &copy; OpenStreetMap contributors',
      }
    ).addTo(map);

    mapRef.current = map;

    loadDefaultGeoJSON();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const getStyle = (feature: any) => {
    const type = feature?.properties?.type;
    return type
      ? // @ts-ignore
        STYLE[type] || DEFAULT_STYLE
      : DEFAULT_STYLE;
  };

  const pointToLayer = (
    feature: any,
    latlng: L.LatLngExpression
  ) => {
    const type = feature?.properties?.type;

    const isCenter =
      type === "teeboxcenter" ||
      type === "greencenter";

    return L.circleMarker(latlng, {
      radius: isCenter ? 5 : 3,
      color: isCenter ? "#0f172a" : "#334155",
      weight: 1.5,
      fillColor: isCenter ? "#ffffff" : "#cbd5e1",
      fillOpacity: 1,
    });
  };

  const renderGeoJSON = (geojson: GeoJSONData) => {
    const map = mapRef.current;

    if (!map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
    }

    const layer = L.geoJSON(geojson as any, {
      style: getStyle,
      pointToLayer,
    }).addTo(map);

    layerRef.current = layer;

    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.12));
    } else {
      map.setView([0, 0], 2);
    }
  };

  const loadDefaultGeoJSON = async () => {
    try {
      const response = await fetch("/course.geojson");
      const geojson = await response.json();
      renderGeoJSON(geojson);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(
          e.target?.result as string
        );

        renderGeoJSON(geojson);

        setStatus(`Loaded: ${file.name}`);
      } catch (err) {
        setStatus(
          `Error: invalid JSON — ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Pin Vision Map Visualizer</h1>

        <div className="controls">
          <label htmlFor="file-input" className="btn">
            Load GeoJSON
          </label>

          <input
            id="file-input"
            type="file"
            accept=".geojson,.json"
            onChange={handleFileUpload}
            hidden
          />

          <span className="status">{status}</span>
        </div>

        <div className="legend">
          <Legend color="#8ace5e" label="Fairway / Teebox" />
          <Legend color="#bbe999" label="Green" />
          <Legend color="#f8efc6" label="Bunker" />
          <Legend color="#99ddff" label="Water" />
          <Legend
            color="rgba(0,0,0,0.15)"
            border="rgba(0,0,0,0.3)"
            label="Hole"
          />
        </div>
      </header>

      <div
        ref={mapContainerRef}
        className="map"
      />
    </div>
  );
}

function Legend({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: string;
}) {
  return (
    <div className="legend-item">
      <div
        className="legend-swatch"
        style={{
          background: color,
          border: `1px solid ${border || "rgba(0,0,0,0.15)"}`,
        }}
      />
      {label}
    </div>
  );
}