"use server";


import {connectToDatabase} from "@/database/mongoose";
import {getUserInfo} from "@/lib/actions/user.actions";
import {nowUnityIsoString} from "@/lib/helper";
import {downloadClubImages, uploadFolder} from "@/lib/actions/file.actions";
import {ScreenInfoModel} from "@/database/models/screen.model";
import {broadcastScreenUpdate} from "@/lib/sse";
import {revalidatePath} from "next/cache";

export async function applyPinVisionChanges() {
    try {
        await connectToDatabase();
        const userInfo = await getUserInfo();
        if (!userInfo || !userInfo.screenJson || !userInfo.screenJson?.isGolfClub || userInfo.screenJson?.pinVisionID == "") {
            return { success: false, error: "No screen data found" };
        }
        const data = userInfo.screenJson;



        return { success: true };

    } catch (e) {
        console.error("applyScreenChange error:", e);
        return { success: false };
    }
}

export async function getPinVisionGeo()
{
        await connectToDatabase();
        const userInfo = await getUserInfo();
        if (!userInfo || !userInfo.screenJson || !userInfo.screenJson?.isGolfClub || userInfo.screenJson?.pinVisionID == "") {
            return { success: false, error: "No screen data found" };
        }



        return ;
}