import MapPickerModal from "@/components/golf/MapPickerModal";
import InputField from "../forms/InputField";

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
    courseLatLon?: { lat: number; lon: number };
};

export default function HoleCoordinatesEditor({
                                                  courseName,
                                                  hole,
                                                  index,
                                                  form,
                                                  updateCourse,
                                                  courseLatLon,
                                              }: HoleCoordinatesEditorProps) {
    const coordKeys = [
        "holePointLatLong",
        "whiteTeePointLatLong",
        "yellowTeePointLatLong",
        "redTeePointLatLong",
    ];

    return (
        <div className="space-y-6">
            {coordKeys.map((key) => {
                const value = hole[key];
                if (!value) return null;

                const start = {
                    lat: value.x ?? courseLatLon?.lat ?? 0,
                    lon: value.y ?? courseLatLon?.lon ?? 0,
                };

                return (
                    <div key={key} className="space-y-2">
                        {/* Friendly label + quick-fill */}
                        <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{LABELS[key]}</p>
                        </div>

                        {/* Inputs + map picker */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                            <MapPickerModal
                                start={start}
                                onSelect={(coords) => {
                                    updateCourse(
                                        courseName,
                                        `holesData.${index}.${key}.x`,
                                        coords.lat
                                    );
                                    updateCourse(
                                        courseName,
                                        `holesData.${index}.${key}.y`,
                                        coords.lon
                                    );
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}