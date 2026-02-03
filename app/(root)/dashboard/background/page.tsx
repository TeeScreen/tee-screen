import React from "react";
import UploadSection from "@/components/UploadSection";
import {Wallpaper} from "lucide-react";

export default function Page() {
    const clubName = "test";
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Wallpaper/> Background
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection clubName={clubName} fileName="Background.png" label="Background"/>
            </div>
        </div>
    );
}
