import React from "react";
import UploadSection from "@/components/UploadSection";
import {Eye} from "lucide-react";

export default function Page() {
    const clubName = "test";
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Eye/> Screensavers
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection clubName={clubName} fileName="Screensaver01.png" label="Screensaver 01" />
                <UploadSection clubName={clubName} fileName="Screensaver02.png" label="Screensaver 02" />
                <UploadSection clubName={clubName} fileName="Screensaver03.png" label="Screensaver 03" />
                <UploadSection clubName={clubName} fileName="Screensaver04.png" label="Screensaver 04" />
                <UploadSection clubName={clubName} fileName="Screensaver05.png" label="Screensaver 05" />
                <UploadSection clubName={clubName} fileName="Screensaver06.png" label="Screensaver 06" />
                <UploadSection clubName={clubName} fileName="Screensaver07.png" label="Screensaver 07" />
                <UploadSection clubName={clubName} fileName="Screensaver08.png" label="Screensaver 08" />
                <UploadSection clubName={clubName} fileName="Screensaver09.png" label="Screensaver 09" />
                <UploadSection clubName={clubName} fileName="Screensaver010.png" label="Screensaver 010" />
            </div>
        </div>
    );
}
