import React from "react";
import { getUserInfo } from "@/lib/actions/user.actions";
import { MapIcon } from "lucide-react";
import TeeSheetUploader from "@/components/golf/TeeSheetUploader";

export const dynamic = "force-dynamic";

export default async function Page() {
    let user: any = {};

    try {
        user = await getUserInfo();
    } catch (e) {
        console.warn("Failed to fetch user info", e);
    }

    const screenJson = user?.screenJson;
    const folderName = screenJson?.["FolderNameOnServer"] || null;

    return (
        <div>
            <h1 className="h-12 flex flex-row gap-4 text-2xl font-bold w-auto">
                <MapIcon /> Tee Sheet Uploads
            </h1>

            <div className="@container/main flex flex-col gap-10 md:gap-12">

                {/* FRONT 9 */}
                <section className="space-y-6">
                    <h2 className="text-xl font-semibold">Front 9 Tee Sheet</h2>
                    <TeeSheetUploader folderName={`${folderName}_Front9`} />
                </section>

                {/* BACK 9 */}
                <section className="space-y-6">
                    <h2 className="text-xl font-semibold">Back 9 Tee Sheet</h2>
                    <TeeSheetUploader folderName={`${folderName}_Back9`} />
                </section>

            </div>
        </div>
    );
}
