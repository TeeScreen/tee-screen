import React from "react";
import UploadSection from "@/components/UploadSection";
import {Flag} from "lucide-react";

export default function Page() {
    const clubName = "test";
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Flag/> Notices
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection clubName={clubName} fileName="NoticeImage01.png" label="Notice Image Top"/>
                <UploadSection clubName={clubName} fileName="NoticeImage02.png" label="Notice Image Middle"/>
                <UploadSection clubName={clubName} fileName="NoticeImage03.png" label="Notice Image Bottom"/>
            </div>
        </div>
    );
}
