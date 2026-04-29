import React from "react";
import {PanelTopBottomDashed} from "lucide-react";
import { JsonFieldEditor } from "@/components/json/JsonFieldEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";
import VideoViewer from "@/components/stream/VideoViewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;

    return (
        <div>
            <VideoViewer/>
        </div>
    );
}