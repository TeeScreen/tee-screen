import React from "react";
import UploadSection from "@/components/UploadSection";
import { NotebookTabs } from "lucide-react";
import { JsonFieldEditor } from "@/components/json/JsonFieldEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <NotebookTabs /> Custom Tabs
            </h1>

            <div className="@container/main flex flex-col gap-8 md:gap-10">
                {screenJson && (
                    <>
                        {/* ---------------- TAB 01 ---------------- */}
                        <div id="tab01" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Custom Tab 01</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "CustomTab01Active", label: "Tab 01 Active", type: "bool", tag: "tab 1" },
                                    { path: "CustomTab01Name", label: "Tab 01 Name", type: "text", tag: "tab 1" },
                                    { path: "CustomTab01UrlActive", label: "Tab 01 URL Active", type: "bool", tag: "tab 1" },
                                    { path: "CustomTab01Url", label: "Tab 01 URL", type: "text", tag: "tab 1" },
                                ]}
                                action={updateScreenJson}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadSection folderName={folderName} fileName="CustomTabIcon01.png" label="Custom Tab Icon 01" />
                                <UploadSection folderName={folderName} fileName="CustomTabImage01" label="Custom Tab Image 01" />
                            </div>
                        </div>

                        {/* ---------------- TAB 02 ---------------- */}
                        <div id="tab02" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Custom Tab 02</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "CustomTab02Active", label: "Tab 02 Active", type: "bool", tag: "tab 2" },
                                    { path: "CustomTab02Name", label: "Tab 02 Name", type: "text", tag: "tab 2" },
                                    { path: "CustomTab02UrlActive", label: "Tab 02 URL Active", type: "bool", tag: "tab 2" },
                                    { path: "CustomTab02Url", label: "Tab 02 URL", type: "text", tag: "tab 2" },
                                ]}
                                action={updateScreenJson}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadSection folderName={folderName} fileName="CustomTabIcon02.png" label="Custom Tab Icon 02" />
                                <UploadSection folderName={folderName} fileName="CustomTabImage02" label="Custom Tab Image 02" />
                            </div>
                        </div>

                        {/* ---------------- TAB 03 ---------------- */}
                        <div id="tab03" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Custom Tab 03</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "CustomTab03Active", label: "Tab 03 Active", type: "bool", tag: "tab 3" },
                                    { path: "CustomTab03Name", label: "Tab 03 Name", type: "text", tag: "tab 3" },
                                    { path: "CustomTab03UrlActive", label: "Tab 03 URL Active", type: "bool", tag: "tab 3" },
                                    { path: "CustomTab03Url", label: "Tab 03 URL", type: "text", tag: "tab 3" },
                                ]}
                                action={updateScreenJson}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadSection folderName={folderName} fileName="CustomTabIcon03.png" label="Custom Tab Icon 03" />
                                <UploadSection folderName={folderName} fileName="CustomTabImage03" label="Custom Tab Image 03" />
                            </div>
                        </div>

                        {/* ---------------- TAB 04 ---------------- */}
                        <div id="tab04" className="space-y-4 border rounded-lg p-4">
                            <h2 className="text-lg font-semibold">Custom Tab 04</h2>
                            <JsonFieldEditor
                                json={screenJson}
                                paths={[
                                    { path: "CustomTab04Active", label: "Tab 04 Active", type: "bool", tag: "tab 4" },
                                    { path: "CustomTab04Name", label: "Tab 04 Name", type: "text", tag: "tab 4" },
                                    { path: "CustomTab04UrlActive", label: "Tab 04 URL Active", type: "bool", tag: "tab 4" },
                                    { path: "CustomTab04Url", label: "Tab 04 URL", type: "text", tag: "tab 4" },
                                ]}
                                action={updateScreenJson}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <UploadSection folderName={folderName} fileName="CustomTabIcon04.png" label="Custom Tab Icon 04" />
                                <UploadSection folderName={folderName} fileName="CustomTabImage04" label="Custom Tab Image 04" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
