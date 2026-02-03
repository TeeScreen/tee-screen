import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {ScreenData, UserInfoModel} from "@/database/models/user.model";


export async function addUserInfo(data: {
    userId: string;
    fullName?: string;
    phoneNumber?: string;
    clubName?: string;
    clubType?: string;
    role?: string;
    loadedScreen?: string;
}){
    try {
        const userID: string = data.userId;

        const existingItem = await UserInfoModel.findOne({
            userId: userID,
        });

        if (existingItem) {
            return { success: false, error: 'Stock already in watchlist' };
        }

        // Add to watchlist
        const newItem = new UserInfoModel({
            userId: data.userId,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            clubName: data.clubName,
            clubType: data.clubType,
            role: data.role,
        });

        await newItem.save();
        revalidatePath('/');

        return { success: true, message: 'UserData Saved Successfully' };
    } catch (error) {
        console.error('Error saving user Data:', error);
        throw new Error('Failed to save Data');
    }
}

export async function saveUserInfo(data: {
    fullName?: string;
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

    // 1. Check if screenLogin already exists for this user
    const existing = await UserInfoModel.findOne({
        userId,
        "screenDetails.screenLogin": screen.screenLogin
    });

    if (existing) {
        throw new Error(`Screen login "${screen.screenLogin}" already exists for this user.`);
    }

    // 2. Add new screen
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $push: { screenDetails: screen } },
        { new: true }
    );

    console.log(screen);

    return JSON.parse(JSON.stringify(updated));
}

export async function removeScreenData(screenLogin: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    console.log(screenLogin);
    const userId: string = session.user.id;
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $pull: { screenDetails: { screenLogin } } },
        { new: true }
    );

    return JSON.parse(JSON.stringify(updated));
}




