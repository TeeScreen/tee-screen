import React from "react";
import UploadSection from "@/components/UploadSection";
import {NotebookTabs, Upload} from "lucide-react";
import {JsonFieldEditor} from "@/components/json/JsonFieldEditor";
import {getUserInfo, updateScreenJson} from "@/lib/actions/user.actions";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;
    const uploads = [
        { image: "CustomTabImage01.png", icon: "CustomTabIcon01.png", label: "01" },
        { image: "CustomTabImage02.png", icon: "CustomTabIcon02.png", label: "02" },
        { image: "CustomTabImage03.png", icon: "CustomTabIcon03.png", label: "03" },
        { image: "CustomTabImage04.png", icon: "CustomTabIcon04.png", label: "04" },
    ];
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <NotebookTabs/> Custom Tabs
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                {screenJson && (
                    <JsonFieldEditor
                        json={screenJson}
                        paths={[
                            // ---------------- TAB 01 ----------------
                            { path: "CustomTab01Active", label: "Tab 01 Active", type: "bool", tag: "tab 1" },
                            { path: "CustomTab01Name", label: "Tab 01 Name", type: "text", tag: "tab 1" },
                            { path: "CustomTab01UrlActive", label: "Tab 01 URL Active", type: "bool", tag: "tab 1" },
                            { path: "CustomTab01Url", label: "Tab 01 URL", type: "text", tag: "tab 1" },

                            // ---------------- TAB 02 ----------------
                            { path: "CustomTab02Active", label: "Tab 02 Active", type: "bool", tag: "tab 2" },
                            { path: "CustomTab02Name", label: "Tab 02 Name", type: "text", tag: "tab 2" },
                            { path: "CustomTab02UrlActive", label: "Tab 02 URL Active", type: "bool", tag: "tab 2" },
                            { path: "CustomTab02Url", label: "Tab 02 URL", type: "text", tag: "tab 2" },

                            // ---------------- TAB 03 ----------------
                            { path: "CustomTab03Active", label: "Tab 03 Active", type: "bool", tag: "tab 3" },
                            { path: "CustomTab03Name", label: "Tab 03 Name", type: "text", tag: "tab 3" },
                            { path: "CustomTab03UrlActive", label: "Tab 03 URL Active", type: "bool", tag: "tab 3" },
                            { path: "CustomTab03Url", label: "Tab 03 URL", type: "text", tag: "tab 3" },

                            // ---------------- TAB 04 ----------------
                            { path: "CustomTab04Active", label: "Tab 04 Active", type: "bool", tag: "tab 4" },
                            { path: "CustomTab04Name", label: "Tab 04 Name", type: "text", tag: "tab 4" },
                            { path: "CustomTab04UrlActive", label: "Tab 04 URL Active", type: "bool", tag: "tab 4" },
                            { path: "CustomTab04Url", label: "Tab 04 URL", type: "text", tag: "tab 4" },
                        ]}
                        action={updateScreenJson}
                    />
                )}

                <h1 className="flex flex-row gap-4 text-lg font-bold w-auto ">
                    <Upload/> Icons & Images
                </h1>
                <Accordion type="single" collapsible className="w-full space-y-4 border rounded-lg p-2">
                    {uploads.map((u, i) => (
                        <AccordionItem key={i} value={`item-${i}`}>
                            <AccordionTrigger className="text-lg">
                                Custom Tab {u.label}
                            </AccordionTrigger>

                            <AccordionContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                    <UploadSection
                                        folderName={folderName}
                                        fileName={u.icon}
                                        label={`Custom Tab Icon ${u.label}`}
                                    />
                                    <UploadSection
                                        folderName={folderName}
                                        fileName={u.image}
                                        label={`Custom Tab Image ${u.label}`}
                                    />

                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
