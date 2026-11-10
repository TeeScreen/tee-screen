import React from "react";
import UploadSection from "@/components/UploadSection";
import {Eye} from "lucide-react";
import {getUserInfo, isUserAdmin} from "@/lib/actions/user.actions";
import PreviewScreensaver from "@/components/demo/PreviewScreensaver";

export const dynamic = "force-dynamic";

export default async function Page() {
    const user = await getUserInfo();
    const screenJson = user?.screenJson;
    const folderName = user?.screenJson?.["FolderNameOnServer"] || null;

    const isAdmin = await isUserAdmin();
    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto ">
                <Eye/> Screensavers
            </h1>


            <div className="@container/main flex flex-col gap-4 md:gap-6">
                <UploadSection folderName={folderName} fileName="ScreensaverImage01" label="Screensaver 01"/>
                <PreviewScreensaver fileName="ScreensaverImage01" label="Screensaver 01"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage02" label="Screensaver 02"/>
                <PreviewScreensaver fileName="ScreensaverImage02" label="Screensaver 02"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage03" label="Screensaver 03"/>
                <PreviewScreensaver fileName="ScreensaverImage03" label="Screensaver 03"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage04" label="Screensaver 04"/>
                <PreviewScreensaver fileName="ScreensaverImage04" label="Screensaver 04"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage05" label="Screensaver 05"/>
                <PreviewScreensaver fileName="ScreensaverImage05" label="Screensaver 05"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage06" label="Screensaver 06"/>
                <PreviewScreensaver fileName="ScreensaverImage06" label="Screensaver 06"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage07" label="Screensaver 07"/>
                <PreviewScreensaver fileName="ScreensaverImage07" label="Screensaver 07"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage08" label="Screensaver 08"/>
                <PreviewScreensaver fileName="ScreensaverImage08" label="Screensaver 08"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage09" label="Screensaver 09"/>
                <PreviewScreensaver fileName="ScreensaverImage09" label="Screensaver 09"/>

                <UploadSection folderName={folderName} fileName="ScreensaverImage010" label="Screensaver 10"/>
                <PreviewScreensaver fileName="ScreensaverImage010" label="Screensaver 10"/>
            </div>


            {isAdmin && (
                <div className="@container/main flex flex-col gap-4 md:gap-6">
                    <UploadSection folderName={folderName} fileName="ScreensaverImage011" label="Screensaver 011"/>
                    <PreviewScreensaver fileName="ScreensaverImage011" label="Screensaver 011"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage012" label="Screensaver 012"/>
                    <PreviewScreensaver fileName="ScreensaverImage012" label="Screensaver 012"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage013" label="Screensaver 013"/>
                    <PreviewScreensaver fileName="ScreensaverImage013" label="Screensaver 013"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage014" label="Screensaver 014"/>
                    <PreviewScreensaver fileName="ScreensaverImage014" label="Screensaver 014"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage015" label="Screensaver 015"/>
                    <PreviewScreensaver fileName="ScreensaverImage015" label="Screensaver 015"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage016" label="Screensaver 016"/>
                    <PreviewScreensaver fileName="ScreensaverImage016" label="Screensaver 016"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage017" label="Screensaver 017"/>
                    <PreviewScreensaver fileName="ScreensaverImage017" label="Screensaver 017"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage018" label="Screensaver 018"/>
                    <PreviewScreensaver fileName="ScreensaverImage018" label="Screensaver 018"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage019" label="Screensaver 019"/>
                    <PreviewScreensaver fileName="ScreensaverImage019" label="Screensaver 019"/>

                    <UploadSection folderName={folderName} fileName="ScreensaverImage020" label="Screensaver 020"/>
                    <PreviewScreensaver fileName="ScreensaverImage020" label="Screensaver 020"/>
                </div>)

            }
        </div>
    );
}
