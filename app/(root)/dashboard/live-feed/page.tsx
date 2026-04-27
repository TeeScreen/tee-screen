import React from "react";
import {PanelTopBottomDashed} from "lucide-react";
import { JsonFieldEditor } from "@/components/json/JsonFieldEditor";
import { getUserInfo, updateScreenJson } from "@/lib/actions/user.actions";
import Viewer from "@/components/stream/Viewer";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;

    return (
        <div>
            <Viewer/>
        </div>
    );
}