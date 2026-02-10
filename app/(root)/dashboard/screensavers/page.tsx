import React from "react";
import UploadSection from "@/components/UploadSection";
import {Eye} from "lucide-react";
import {getUserInfo} from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Eye/> Screensavers
            </h1>
            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection folderName={folderName} fileName="Screensaver01.png" label="Screensaver 01" />
                <UploadSection folderName={folderName} fileName="Screensaver02.png" label="Screensaver 02" />
                <UploadSection folderName={folderName} fileName="Screensaver03.png" label="Screensaver 03" />
                <UploadSection folderName={folderName} fileName="Screensaver04.png" label="Screensaver 04" />
                <UploadSection folderName={folderName} fileName="Screensaver05.png" label="Screensaver 05" />
                <UploadSection folderName={folderName} fileName="Screensaver06.png" label="Screensaver 06" />
                <UploadSection folderName={folderName} fileName="Screensaver07.png" label="Screensaver 07" />
                <UploadSection folderName={folderName} fileName="Screensaver08.png" label="Screensaver 08" />
                <UploadSection folderName={folderName} fileName="Screensaver09.png" label="Screensaver 09" />
                <UploadSection folderName={folderName} fileName="Screensaver010.png" label="Screensaver 010" />
            </div>
        </div>
    );
}
