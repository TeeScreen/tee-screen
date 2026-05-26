import React from "react";
import UploadSection from "@/components/UploadSection";
import { Flag } from "lucide-react";
import { JsonFieldEditor } from "@/components/json/JsonFieldEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";
import ScheduleUploader from "@/components/schedule/ScheduleUploader";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <Flag /> Notices
            </h1>

            <div className="@container/main flex flex-col gap-8 md:gap-10">
                {screenJson && (
                    <>
                        {/* ---------------- TOP ---------------- */}
                        <div className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Top Notice</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "TopNoticeText", label: "Top Notice Text", type: "text", tag: "top notice" },
                                    { path: "TopNoticeButtonActive", label: "Top Notice Button Active", type: "bool", tag: "top notice" },
                                    { path: "TopNoticeBoardColour", label: "Top Notice Board Colour", type: "color", tag: "top notice" },
                                    { path: "showUrlNoticeButtonTop", label: "Show URL Button (Top)", type: "bool", tag: "top notice" },
                                    { path: "urlNoticeButtonTop", label: "URL for Top Notice Button", type: "text", tag: "top notice" },
                                ]}
                                action={updateScreenJson}
                            />
                            <UploadSection folderName={folderName} fileName="NoticeImage01" label="Notice Image Top" />
                        </div>

                        {/* ---------------- MIDDLE ---------------- */}
                        <div className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Middle Notice</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "MiddleNoticeText", label: "Middle Notice Text", type: "text", tag: "middle notice" },
                                    { path: "MiddleNoticeButtonActive", label: "Middle Notice Button Active", type: "bool", tag: "middle notice" },
                                    { path: "MiddleNoticeBoardColour", label: "Middle Notice Board Colour", type: "color", tag: "middle notice" },
                                    { path: "showUrlNoticeButtonMiddle", label: "Show URL Button (Middle)", type: "bool", tag: "middle notice" },
                                    { path: "urlNoticeButtonMiddle", label: "URL for Middle Notice Button", type: "text", tag: "middle notice" },
                                ]}
                                action={updateScreenJson}
                            />
                            <UploadSection folderName={folderName} fileName="NoticeImage02" label="Notice Image Middle" />
                        </div>

                        {/* ---------------- BOTTOM ---------------- */}
                        <div className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Bottom Notice</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "BottomNoticeText", label: "Bottom Notice Text", type: "text", tag: "bottom notice" },
                                    { path: "BottomNoticeButtonActive", label: "Bottom Notice Button Active", type: "bool", tag: "bottom notice" },
                                    { path: "BottomNoticeBoardColour", label: "Bottom Notice Board Colour", type: "color", tag: "bottom notice" },
                                    { path: "showUrlNoticeButtonBottom", label: "Show URL Button (Bottom)", type: "bool", tag: "bottom notice" },
                                    { path: "urlNoticeButtonBottom", label: "URL for Bottom Notice Button", type: "text", tag: "bottom notice" },
                                ]}
                                action={updateScreenJson}
                            />
                            <UploadSection folderName={folderName} fileName="NoticeImage03" label="Notice Image Bottom" />
                        </div>
                        <div>
                            <ScheduleUploader screenName={screenJson.name}/>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
