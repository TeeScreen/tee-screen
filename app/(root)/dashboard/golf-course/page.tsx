import React from "react";
import { GolfCoursesEditor } from "@/components/json/GolfCoursesEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";
import {Loader2, MapIcon} from "lucide-react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import HolesEditorWrapper from "@/components/golf/HolesEditorWrapper";
import HandicapEditor from "@/components/json/HandicapEditor";
import UploadSection from "@/components/UploadSection";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;
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

                {screenJson && (
                    <Accordion type="multiple" className="space-y-4">
                        {Object.entries(screenJson.golfCoursesData).map(
                            ([courseName, courseData]: any) => (
                                <AccordionItem key={courseName} value={courseName}>
                                    <AccordionTrigger className="text-xl font-semibold flex items-center gap-2">
                                        <span>{courseName} - Flyover Videos</span>
                                    </AccordionTrigger>

                                    <AccordionContent className="space-y-6">
                                        {Object.entries(courseData.holesData).map(
                                            (hole, i) => (
                                                <UploadSection key={i} folderName={folderName} fileName={`HoleVideo${i+1}`} label={`HoleVideo${i+1}`} />
                                            ))}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        )}
                    </Accordion>
                )}
            </div>
        </div>
    );
}