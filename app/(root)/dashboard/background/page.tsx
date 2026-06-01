import React from "react";
import UploadSection from "@/components/UploadSection";
import {Wallpaper} from "lucide-react";
import {getUserInfo} from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Wallpaper/> Background
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection folderName={folderName} fileName="Background.png" label="Background" recommendedSize="1080 x 1920"/>
            </div>
        </div>
    );
}
