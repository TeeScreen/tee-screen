import React from "react";
import UploadSection from "@/components/UploadSection";
import {Eye} from "lucide-react";
import {getUserInfo} from "@/lib/actions/user.actions";
import PreviewScreensaver from "@/components/demo/PreviewScreensaver";

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
                <UploadSection folderName={folderName} fileName="ScreensaverImage01" label="Screensaver 01" />
                <PreviewScreensaver fileName="ScreensaverImage01" label="Screensaver 01"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage02" label="Screensaver 02" />
                <PreviewScreensaver fileName="ScreensaverImage02" label="Screensaver 02"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage03" label="Screensaver 03" />
                <PreviewScreensaver fileName="ScreensaverImage03" label="Screensaver 03"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage04" label="Screensaver 04" />
                <PreviewScreensaver fileName="ScreensaverImage04" label="Screensaver 04"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage05" label="Screensaver 05" />
                <PreviewScreensaver fileName="ScreensaverImage05" label="Screensaver 05"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage06" label="Screensaver 06" />
                <PreviewScreensaver fileName="ScreensaverImage06" label="Screensaver 06"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage07" label="Screensaver 07" />
                <PreviewScreensaver fileName="ScreensaverImage07" label="Screensaver 07"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage08" label="Screensaver 08" />
                <PreviewScreensaver fileName="ScreensaverImage08" label="Screensaver 08"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage09" label="Screensaver 09" />
                <PreviewScreensaver fileName="ScreensaverImage09" label="Screensaver 09"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage10" label="Screensaver 10" />
                <PreviewScreensaver fileName="ScreensaverImage10" label="Screensaver 10"/>
            </div>
        </div>
    );
}
