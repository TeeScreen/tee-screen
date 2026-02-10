import React from "react";
import {PanelTopBottomDashed} from "lucide-react";
import { JsonFieldEditor } from "@/components/json/JsonFieldEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <PanelTopBottomDashed/> UI Elements
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                {screenJson && (
                    <JsonFieldEditor
                        json={screenJson}
                        paths={[
                            { path: "font", label: "Font", type: "number", tag: "UI" },
                            { path: "showTopSection", label: "Show Top Section", type: "bool", tag: "UI" },
                            { path: "setTabIconsToFill", label: "Set Tab Icons to Fill", type: "bool", tag: "UI" },
                            { path: "UIColor", label: "UI Color", type: "color", tag: "UI" },
                        ]}
                        action={updateScreenJson}
                    />
                )}
            </div>
        </div>
    );
}