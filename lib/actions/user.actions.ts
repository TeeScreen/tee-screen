import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {ScreenData, UserInfoModel} from "@/database/models/user.model";


export async function saveUserInfo(data: {
    fullName: string;
    phoneNumber?: string;
    clubName?: string;
    clubType?: string;
    role?: string;
    loadedScreen?: string;
}){
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) redirect('/sign-in');

        const userId: string = session.user.id;

        const updated = await UserInfoModel.findOneAndUpdate(
            { userId },
            { userId, ...data },
            { upsert: true, new: true }
        );
        revalidatePath('/');

        return { success: true, message: 'UserData Saved Successfully' };
    } catch (error) {
        console.error('Error saving user Data:', error);
        throw new Error('Failed to save Data');
    }
}

export async function getUserInfo() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    const userId: string = session.user.id;
    const user = await UserInfoModel.findOne({ userId });
    return JSON.parse(JSON.stringify(user));
}

export async function addScreenData(screen: ScreenData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) redirect('/sign-in');

    const userId: string = session.user.id;

    // 1. Check if screenName already exists for this user
    const existing = await UserInfoModel.findOne({
        userId,
        "screenDetails.screenName": screen.screenName
    });

    if (existing) {
        throw new Error(`Screen name "${screen.screenName}" already exists for this user.`);
    }

    // 2. Add new screen
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $push: { screenDetails: screen } },
        { new: true }
    );

    return JSON.parse(JSON.stringify(updated));
}

export async function removeScreenData(screenName: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    const userId: string = session.user.id;
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $pull: { screenDetails: { screenName } } },
        { new: true }
    );

    return JSON.parse(JSON.stringify(updated));
}




