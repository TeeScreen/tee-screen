'use client'
import {usePreviewState} from "@/stores/user-store";


export function PreviewCourses({
                                  courses,
                              }: {
    courses: string[];
}) {

    const{selectedCourse, setSelectedCourse} = usePreviewState();

    const handleClick = async (course: string) => {
        setSelectedCourse(course);
        console.log("Selected Course: " , selectedCourse);
    }

    return (
        <div className="flex flex-col gap-2 w-full">
            <select
                value={selectedCourse}
                onChange={(e) => handleClick(e.target.value)}
                className="
                    absolute top-[10.5%] left-[1vh]
                     h-[4vh] px-[1vh]
                    border border-input
                    bg-background
                    rounded-md
                    text-[1.5vh]
                    z-50
                    focus:outline-none
                    focus:ring-2
                    focus:ring-ring
                "
            >
                <option value="" disabled>
                    Select a course
                </option>

                {courses.map((course) => (
                    <option key={course} value={course}>
                        {course}
                    </option>
                ))}
            </select>
        </div>
    );
}