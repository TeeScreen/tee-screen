import MapPickerModal from "@/components/golf/MapPickerModal";

const LABELS: Record<string, string> = {
    holePointLatLong: "Hole Center",
    whiteTeePointLatLong: "White Tee",
    yellowTeePointLatLong: "Yellow Tee",
    redTeePointLatLong: "Red Tee",
};

type HoleCoordinatesEditorProps = {
    courseName: string;
    hole: any;
    index: number;
    form: any;
    updateCourse: (courseName: string, path: string, value: any) => void;
    updateCourseBatch: (courseName: string, updates: Record<string, any>) => void;
    courseLatLon?: { lat: number; lon: number };
};

export default function HoleCoordinatesEditor({
                                                  courseName,
                                                  hole,
                                                  index,
                                                  form,
                                                  updateCourse,
                                                  updateCourseBatch,
                                                  courseLatLon,
                                              }: HoleCoordinatesEditorProps){
    const clubLocation = courseLatLon ?? { lat: 0, lon: 0 };

    const normalize = (value: any) => ({
        lat: value?.x ?? clubLocation.lat,
        lon: value?.y ?? clubLocation.lon,
    });

    const points = {
        holePointLatLong: normalize(hole.holePointLatLong),
        whiteTeePointLatLong: normalize(hole.whiteTeePointLatLong),
        yellowTeePointLatLong: normalize(hole.yellowTeePointLatLong),
        redTeePointLatLong: normalize(hole.redTeePointLatLong),
    };

    const holeNumber = index + 1;

    return (
        <div className="space-y-6">
            {/* Header row with global map picker */}
            <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Hole {holeNumber} Coordinates</p>

                <MapPickerModal
                    points={points}
                    clubLocation={clubLocation}
                    holeNumber={holeNumber}
                    onSelect={(updated) => {
                        const updates: Record<string, any> = {};

                        Object.entries(updated).forEach(([key, coords]) => {
                            updates[`holesData.${index}.${key}.x`] = coords.lat;
                            updates[`holesData.${index}.${key}.y`] = coords.lon;
                        });

                        updateCourseBatch(courseName, updates);
                    }}
                />
            </div>

            {/* Individual inputs per marker */}
            {(
                Object.entries(points) as [keyof typeof points, { lat: number; lon: number }][]
            ).map(([key, coords]) => (
                <div key={key} className="space-y-2">
                    <p className="font-medium text-xs text-muted-foreground">
                        {LABELS[key]}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Latitude</label>
                            <input
                                type="number"
                                className="border rounded px-2 py-1 text-sm"
                                value={coords.lat}
                                onChange={(e) =>
                                    updateCourse(
                                        courseName,
                                        `holesData.${index}.${key}.x`,
                                        parseFloat(e.target.value)
                                    )
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium">Longitude</label>
                            <input
                                type="number"
                                className="border rounded px-2 py-1 text-sm"
                                value={coords.lon}
                                onChange={(e) =>
                                    updateCourse(
                                        courseName,
                                        `holesData.${index}.${key}.y`,
                                        parseFloat(e.target.value)
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
