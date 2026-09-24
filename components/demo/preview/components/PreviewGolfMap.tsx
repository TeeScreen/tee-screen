'use client'

import {useMemo} from 'react'
import {MapContainer, Marker, TileLayer} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-rotate'
import L from 'leaflet'
import {GolfHole, TeeSettings} from '../types'

interface PreviewGolfMapProps {
    golfHole: GolfHole | null
    teeData: TeeSettings | null
    onClose: () => void
}

export default function PreviewGolfMap({
                                           golfHole,
                                           teeData,
                                           onClose,
                                       }: PreviewGolfMapProps) {
    if (!golfHole || !teeData) return null

    const {
        holeNumber,
        holePointLatLong,
        whiteTeePointLatLong,
        yellowTeePointLatLong,
        redTeePointLatLong,
    } = golfHole

    /**
     * Compute bearing so the line hole → white tee is vertical.
     * Leaflet‑rotate uses degrees clockwise from north.
     */
    const bearing = useMemo(() => {
        if (!whiteTeePointLatLong || !holePointLatLong) return 0;

        // 1. Vector from White Tee (origin) to Hole
        const dx = holePointLatLong.x - whiteTeePointLatLong.x;
        const dy = holePointLatLong.y - whiteTeePointLatLong.y;

        // 2. Math.atan2(dy, dx) returns 0° at Right (+X), +90° at Down (+Y), -90° at Up (-Y)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);


        console.log("angle: " + angle)

        return -1* angle;
    }, [holePointLatLong, whiteTeePointLatLong]);

    const zoom = useMemo(() => {
        if (!whiteTeePointLatLong || !holePointLatLong) return 16;

        // 1. Haversine distance (meters)
        const R = 6371000; // Earth radius in meters
        const toRad = (v: number) => (v * Math.PI) / 180;

        const lat1 = whiteTeePointLatLong.x;
        const lon1 = whiteTeePointLatLong.y;
        const lat2 = holePointLatLong.x;
        const lon2 = holePointLatLong.y;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceMeters = R * c;

        // 2. Convert distance → Leaflet zoom
        // Leaflet rule of thumb: visible width ≈ 40075000 / 2^zoom
        // We want the distance to fit comfortably inside the viewport.
        const viewportMeters = distanceMeters *0.8; // add padding
        const zoomLevel = Math.log2(40075000 / viewportMeters);


        // Clamp to reasonable golf-course zoom range
        return zoomLevel //Math.min(Math.max(zoomLevel, 14), 20);
    }, [holePointLatLong, whiteTeePointLatLong]);


    /** Marker icons */
    const holeIcon = L.divIcon({
        className: '',
        html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #00c853;
        transform: rotate(45deg);
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="transform: rotate(-45deg); font-size: 9px; font-weight: 700; color: white;">
          ${holeNumber}
        </div>
      </div>
    `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    })

    type RGBA = { r: number; g: number; b: number; a: number };

    const teeIcon = (rgba: RGBA) =>
        L.divIcon({
            className: '',
            html: `
        <div style="
          width: 18px;
          height: 18px;
          background: rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a / 255});
          border-radius: 50%;
          border: 2px solid white;
        "></div>
      `,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
        });


    const satelliteTiles =
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

    const centre = {
        x: (holePointLatLong.x + whiteTeePointLatLong.x) / 2,
        y: (holePointLatLong.y + whiteTeePointLatLong.y) / 2,
    }

    return (
        <div className="relative w-full h-full flex flex-col gap-3">
            {/* Close button */}
            <button
                className="absolute top-20 right-3 bg-red-600 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-xl z-[1000]"
                onClick={onClose}
            >
                ×
            </button>

            {/* Map */}
            <div className="flex-1 bg-black min-h-[300px] pointer-events-none">
                <MapContainer
                    center={[centre.x, centre.y]}
                    zoom={zoom}
                    zoomControl={false}
                    className="w-full h-full"
                    // leaflet-rotate props
                    rotate={true}
                    rotateControl={false}
                    bearing={bearing}
                >
                    <TileLayer url={satelliteTiles}/>

                    <Marker
                        position={[holePointLatLong.x, holePointLatLong.y]}
                        icon={holeIcon}
                        interactive={false}
                    />

                    <Marker
                        position={[whiteTeePointLatLong.x, whiteTeePointLatLong.y]}
                        icon={teeIcon(teeData.TeeColourWhite)}
                        interactive={false}

                    />

                    <Marker
                        position={[yellowTeePointLatLong.x, yellowTeePointLatLong.y]}
                        icon={teeIcon(teeData.TeeColourYellow)}
                        interactive={false}
                    />

                    <Marker
                        position={[redTeePointLatLong.x, redTeePointLatLong.y]}
                        icon={teeIcon(teeData.TeeColourRed)}
                        interactive={false}
                    />
                </MapContainer>
            </div>
        </div>
    )
}
