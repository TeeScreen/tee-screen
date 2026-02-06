import React from "react";
import { GolfCoursesEditor } from "@/components/json/GolfCoursesEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";
import { MapIcon } from "lucide-react";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <MapIcon /> Golf Courses
            </h1>

            <div className="@container/main flex flex-col gap-4 md:gap-6">
                {screenJson && (
                    <GolfCoursesEditor
                        json={screenJson}
                        action={updateScreenJson}
                    />
                )}
            </div>
        </div>
    );
}