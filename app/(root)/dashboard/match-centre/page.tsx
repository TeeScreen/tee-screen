import React from "react";
import UploadSection from "@/components/UploadSection";
import {Flag, Upload} from "lucide-react";
import {JsonFieldEditor} from "@/components/json/JsonFieldEditor";
import {getUserInfo, updateScreenJson} from "@/lib/actions/user.actions";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Flag/> Match Centre
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                {screenJson && (
                    <JsonFieldEditor
                        json={screenJson}
                        paths={[
                            // ---------------- TOP ----------------
                            { path: "ClubVenueName", label: "Venue Name", type: "text", tag: "Info" },
                            { path: "twitterURL", label: "News URL", type: "text", tag: "Info" },
                        ]}
                        action={updateScreenJson}
                    />
                )}

                <Accordion type="single" collapsible className="w-full space-y-4 border rounded-lg p-2">
                    <AccordionItem value={`0`}>
                        <AccordionTrigger className="text-lg justify-start">
                            <Upload/>Images
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                <UploadSection folderName={folderName} fileName="NoticeImage01.png" label="Home Team" recommendedSize="642 x 400"/>
                                <UploadSection folderName={folderName} fileName="NoticeImage02.png" label="Away Team" recommendedSize="642 x 400"/>
                                <UploadSection folderName={folderName} fileName="NoticeImage03.png" label="Line Up Background" recommendedSize="1080 x 1350"/>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </div>
        </div>
    );
}
