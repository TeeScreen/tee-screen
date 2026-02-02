import React from "react";
import UploadSection from "@/components/UploadSection";
import {FileList} from "@/components/upload/FileList";

export default function Page() {
    return (
        <div>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection fileName="logo.png" label="Logo"/>
                <FileList clubName="test"/>
            </div>
        </div>
    );
}
