import React from "react";
import UploadSection from "@/components/UploadSection";
import {NotebookTabs} from "lucide-react";

export default function Page() {
    const clubName = "test";
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <NotebookTabs/> Custom Tabs
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection clubName={clubName} fileName="CustomTab01.png" label="Custom Tab 01"/>
                <UploadSection clubName={clubName} fileName="CustomTab02.png" label="Custom Tab 02"/>
                <UploadSection clubName={clubName} fileName="CustomTab03.png" label="Custom Tab 03"/>
                <UploadSection clubName={clubName} fileName="CustomTab04.png" label="Custom Tab 04"/>
            </div>
        </div>
    );
}
