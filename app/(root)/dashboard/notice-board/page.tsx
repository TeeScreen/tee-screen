import React from "react";
import UploadSection from "@/components/UploadSection";
import {Flag} from "lucide-react";
import {JsonFieldEditor} from "@/components/json/JsonFieldEditor";
import {getUserInfo, updateScreenJson} from "@/lib/actions/user.actions";
import ScheduleUploader from "@/components/schedule/ScheduleUploader";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <Flag/> Notices
            </h1>

            <div className="@container/main flex flex-col gap-8 md:gap-10">
                {screenJson && (
                    <>
                        {/* ---------------- TOP ---------------- */}
                        <div id="top" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Top Notice</h2>

                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    {
                                        path: "noticeTopIsActive",
                                        label: "Make Notice Active",
                                        type: "bool",
                                        tag: "top notice",
                                        placeholder: true
                                    },

                                    {
                                        path: "TopNoticeText", label: "Text", type: "text", tag: "top notice",
                                        dependencies: [{path: "noticeTopIsActive", value: true}]
                                    },

                                    {
                                        path: "TopNoticeBoardColour",
                                        label: "Board Colour",
                                        type: "color",
                                        tag: "top notice",
                                        dependencies: [{path: "noticeTopIsActive", value: true}]
                                    },

                                    {
                                        path: "TopNoticeButtonActive",
                                        label: "Make Interactive",
                                        type: "bool",
                                        tag: "top notice",
                                        dependencies: [{path: "noticeTopIsActive", value: true}]
                                    },

                                    {
                                        path: "showUrlNoticeButtonTop",
                                        label: "Show URL Button (Top)",
                                        type: "bool",
                                        tag: "top notice",
                                        dependencies: [
                                            {path: "noticeTopIsActive", value: true},
                                            {path: "TopNoticeButtonActive", value: true}
                                        ]
                                    },

                                    {
                                        path: "urlNoticeButtonTop",
                                        label: "URL to Display",
                                        type: "text",
                                        tag: "top notice",
                                        dependencies: [
                                            {path: "noticeTopIsActive", value: true},
                                            {path: "TopNoticeButtonActive", value: true},
                                            {path: "showUrlNoticeButtonTop", value: true}
                                        ]
                                    },
                                ]}
                                action={updateScreenJson}
                            />

                            <div
                                className={(screenJson?.noticeTopIsActive ?? true) && screenJson.TopNoticeButtonActive && !screenJson.showUrlNoticeButtonTop ? "" : "pointer-events-none opacity-50"}>
                                <UploadSection folderName={folderName} fileName="NoticeImage01"
                                               label="Notice Image Top"/>
                            </div>
                        </div>


                        {/* ---------------- MIDDLE ---------------- */}
                        <div id="middle" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Middle Notice</h2>

                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    {
                                        path: "noticeMiddleIsActive",
                                        label: "Make Notice Active",
                                        type: "bool",
                                        tag: "middle notice",
                                        placeholder: true
                                    },

                                    {
                                        path: "MiddleNoticeText", label: "Text", type: "text", tag: "middle notice",
                                        dependencies: [{path: "noticeMiddleIsActive", value: true}]
                                    },

                                    {
                                        path: "MiddleNoticeBoardColour",
                                        label: "Board Colour",
                                        type: "color",
                                        tag: "middle notice",
                                        dependencies: [{path: "noticeMiddleIsActive", value: true}]
                                    },

                                    {
                                        path: "MiddleNoticeButtonActive",
                                        label: "Make Interactive",
                                        type: "bool",
                                        tag: "middle notice",
                                        dependencies: [{path: "noticeMiddleIsActive", value: true}]
                                    },

                                    {
                                        path: "showUrlNoticeButtonMiddle",
                                        label: "Show URL Button (Middle)",
                                        type: "bool",
                                        tag: "middle notice",
                                        dependencies: [
                                            {path: "noticeMiddleIsActive", value: true},
                                            {path: "MiddleNoticeButtonActive", value: true}
                                        ]
                                    },

                                    {
                                        path: "urlNoticeButtonMiddle",
                                        label: "URL to Display",
                                        type: "text",
                                        tag: "middle notice",
                                        dependencies: [
                                            {path: "noticeMiddleIsActive", value: true},
                                            {path: "MiddleNoticeButtonActive", value: true},
                                            {path: "showUrlNoticeButtonMiddle", value: true}
                                        ]
                                    },
                                ]}
                                action={updateScreenJson}
                            />

                            <div
                                className={(screenJson?.noticeMiddleIsActive ?? true) && screenJson.MiddleNoticeButtonActive && !screenJson.showUrlNoticeButtonMiddle ? "" : "pointer-events-none opacity-50"}>
                                <UploadSection folderName={folderName} fileName="NoticeImage02"
                                               label="Notice Image Middle"/>
                            </div>
                        </div>


                        {/* ---------------- BOTTOM ---------------- */}
                        <div id="bottom" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Bottom Notice</h2>

                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    {
                                        path: "noticeBottomIsActive",
                                        label: "Make Notice Active",
                                        type: "bool",
                                        tag: "bottom notice",
                                        placeholder: true
                                    },

                                    {
                                        path: "BottomNoticeText", label: "Text", type: "text", tag: "bottom notice",
                                        dependencies: [{path: "noticeBottomIsActive", value: true}]
                                    },

                                    {
                                        path: "BottomNoticeBoardColour",
                                        label: "Board Colour",
                                        type: "color",
                                        tag: "bottom notice",
                                        dependencies: [{path: "noticeBottomIsActive", value: true}]
                                    },

                                    {
                                        path: "BottomNoticeButtonActive",
                                        label: "Make Interactive",
                                        type: "bool",
                                        tag: "bottom notice",
                                        dependencies: [{path: "noticeBottomIsActive", value: true}]
                                    },

                                    {
                                        path: "showUrlNoticeButtonBottom",
                                        label: "Show URL Button (Bottom)",
                                        type: "bool",
                                        tag: "bottom notice",
                                        dependencies: [
                                            {path: "noticeBottomIsActive", value: true},
                                            {path: "BottomNoticeButtonActive", value: true}
                                        ]
                                    },

                                    {
                                        path: "urlNoticeButtonBottom",
                                        label: "URL to Display",
                                        type: "text",
                                        tag: "bottom notice",
                                        dependencies: [
                                            {path: "noticeBottomIsActive", value: true},
                                            {path: "BottomNoticeButtonActive", value: true},
                                            {path: "showUrlNoticeButtonBottom", value: true}
                                        ]
                                    },
                                ]}
                                action={updateScreenJson}
                            />

                            <div
                                className={(screenJson?.noticeBottomIsActive ?? true) && screenJson.BottomNoticeButtonActive && !screenJson.showUrlNoticeButtonBottom ? "" : "pointer-events-none opacity-50"}>
                                <UploadSection folderName={folderName} fileName="NoticeImage03"
                                               label="Notice Image Bottom"/>
                            </div>
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
