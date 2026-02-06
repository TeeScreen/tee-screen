import MapPickerModal from "@/components/golf/MapPickerModal";
import InputField from "../forms/InputField";

type HoleCoordinatesEditorProps = {
    courseName: string;
    hole: any;
    index: number;
    form: any; // UseFormReturn<any>
    updateCourse: (courseName: string, path: string, value: any) => void;
    courseLatLon?: { lat: number; lon: number }; // optional, for map picker default
};


export default function HoleCoordinatesEditor({
                                                  courseName,
                                                  hole,
                                                  index,
                                                  form,
                                                  updateCourse,
                                              }: HoleCoordinatesEditorProps) {
    const coordKeys = [
        "holePointLatLong",
        "whiteTeePointLatLong",
        "redTeePointLatLong",
        "yellowTeePointLatLong",
    ];

    const courseStart = {
        lat: hole.golfCourseLatLon?.lat ?? 0,
        lon: hole.golfCourseLatLon?.lon ?? 0,
    };

    return (
        <div className="space-y-3">
            {coordKeys.map((key) => {
                const value = hole[key];
                if (!value) return null;

                return (
                    <div key={key} className="space-y-1">
                        <p className="font-medium text-sm">{key}</p>

                        <div className="grid grid-cols-3 gap-2">
                            <InputField
                                name={`${courseName}.holesData.${index}.${key}.x`}
                                label="x"
                                type="number"
                                defaultValue={value.x}
                                register={form.register}
                                validation={{
                                    valueAsNumber: true,
                                    onChange: (e: any) =>
                                        updateCourse(
                                            courseName,
                                            `holesData.${index}.${key}.x`,
                                            Number(e.target.value)
                                        ),
                                }}
                            />

                            <InputField
                                name={`${courseName}.holesData.${index}.${key}.y`}
                                label="y"
                                type="number"
                                defaultValue={value.y}
                                register={form.register}
                                validation={{
                                    valueAsNumber: true,
                                    onChange: (e: any) =>
                                        updateCourse(
                                            courseName,
                                            `holesData.${index}.${key}.y`,
                                            Number(e.target.value)
                                        ),
                                }}
                            />

                            <MapPickerModal
                                start={courseStart}
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