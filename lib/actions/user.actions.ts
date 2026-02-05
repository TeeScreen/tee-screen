"use server";

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {AccountData, UserInfoModel} from "@/database/models/user.model";
import {deleteFolder, zipFolder} from "@/lib/actions/file.actions";
import {UPLOAD_DIR} from "@/lib/constants";
import fs from "fs/promises";

export async function addUserInfo(data: {
    userId: string;
    fullName?: string;
    phoneNumber?: string;
    clubName?: string;
    clubType?: string;
    role?: string;
    loadedAccount?: string;
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

export async function deleteUserInfo() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) redirect("/sign-in");

        const userId = session.user.id;

        // Fetch user info first (in case we need to delete folders)
        const userInfo = await UserInfoModel.findOne({ userId });

        if (!userInfo) {
            return { success: false, error: "User info not found" };
        }

        // Optional: delete screen folder if exists
        if (userInfo.screenJson?.FolderNameOnServer) {
            try {
                await deleteFolder(userInfo.screenJson.FolderNameOnServer);
            } catch (e) {
                console.warn("Failed to delete folder:", e);
            }
        }

        // Delete the entire user info document
        await UserInfoModel.deleteOne({ userId });

        revalidatePath("/");

        return { success: true, message: "User info deleted successfully" };
    } catch (error) {
        console.error("Error deleting user info:", error);
        return { success: false, error: "Failed to delete user info" };
    }
}


export async function saveUserInfo(data: {
    fullName?: string;
    phoneNumber?: string;
    clubName?: string;
    clubType?: string;
    role?: string;
    loadedAccount?: string;
    loadedScreen?: string;
    screenNames?: string[];
    screenJson?: any;
}) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) return null;

        const userId = session.user.id;

        await UserInfoModel.findOneAndUpdate(
            { userId },
            { userId, ...data },
            { upsert: true, new: true }
        );

        revalidatePath("/");

        return { success: true, message: "UserData Saved Successfully" };
    } catch (error) {
        console.error("Error saving user Data:", error);
        throw new Error("Failed to save Data");
    }
}

export async function getUserInfo() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) return null;

    const userId: string = session.user.id;
    const user = await UserInfoModel.findOne({ userId });
    return JSON.parse(JSON.stringify(user));
}

export async function addAccountData(account: AccountData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) return null;

    const userId: string = session.user.id;

    // 1. Check if accountLogin already exists for this user
    const existing = await UserInfoModel.findOne({
        userId,
        "accountDetails.accountLogin": account.accountLogin
    });

    if (existing) {
        throw new Error(`Account login "${account.accountLogin}" already exists for this user.`);
    }
    console.log(account.accountLogin);
    // 2. Add new account
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $push: { accountDetails: account } },
        { new: true }
    );

    console.log(account);

    return JSON.parse(JSON.stringify(updated));
}

export async function removeAccountData(accountLogin: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    console.log(accountLogin);
    const userId: string = session.user.id;
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $pull: { accountDetails: { accountLogin } } },
        { new: true }
    );

    return JSON.parse(JSON.stringify(updated));
}

export async function updateScreenJson(formData: FormData) {
    const raw = formData.get("json");
    if (!raw) return;

    const parsed = JSON.parse(raw as string);

    await saveUserInfo({
        screenJson: parsed,
    });
}

export async function applyScreenChange() {
    try {
        const userInfo = await getUserInfo();
        const data = userInfo.screenJson;

        // 1. Update timestamp
        data.lastEdited = new Date().toISOString();

        // 2. Serialize JSON
        const json = JSON.stringify(data);
        const jsonBlob = new Blob([json], { type: "application/json" });

        // 3. Build multipart form data for JSON
        const jsonForm = new FormData();
        jsonForm.append("file", jsonBlob, `${data.name}.json`);

        // 4. Upload JSON to PHP
        const jsonRes = await fetch(`${process.env.SERVER_URL}/upload_golf_course.php`, {
            method: "POST",
            body: jsonForm,
        });

        if (!jsonRes.ok) {
            throw new Error("Failed to upload JSON");
        }

        // ---------------------------------------------------------
        // STEP 2: ZIP LOCAL IMAGES
        // ---------------------------------------------------------
        const folderName = data.FolderNameOnServer; // same folder used for images
        const zipResult = await zipFolder(folderName);

        console.log(folderName);

        if (!zipResult.success || !zipResult.zipName) {
            throw new Error("Failed to create ZIP");
        }

        // Read ZIP file into a Blob
        const zipPath = `${UPLOAD_DIR}/${folderName}/${zipResult.zipName}`;
        const zipBuffer = await fs.readFile(zipPath);
        const zipBlob = new Blob([zipBuffer], { type: "application/zip" });

        // ---------------------------------------------------------
        // STEP 3: UPLOAD ZIP TO PHP
        // ---------------------------------------------------------
        const zipForm = new FormData();
        zipForm.append("file", zipBlob, zipResult.zipName);

        const zipUploadRes = await fetch(`${process.env.SERVER_URL}/upload_zip_images.php?folder=${folderName}`, {
            method: "POST",
            body: zipForm,
        });

        console.log(zipUploadRes);

        if (!zipUploadRes.ok) {
            throw new Error("Failed to upload ZIP");
        }

        // ---------------------------------------------------------
        // STEP 4: CleanUp
        // ---------------------------------------------------------

        await resetScreenChange();

        // ---------------------------------------------------------
        // STEP 5: Revalidate UI
        // ---------------------------------------------------------
        revalidatePath("/");

        return { success: true };

    } catch (e) {
        console.error("applyScreenChange error:", e);
        return { success: false };
    }
}

export async function resetScreenChange() {
    try {
        const userInfo = await getUserInfo();
        await deleteFolder(userInfo.screenJson["FolderNameOnServer"]);
        await saveUserInfo({
            loadedScreen: "",
            screenJson: null,
        });

        return {success: true, message: "Reset screen"};
    }catch(e)
    {
        return {success: false, error: "Failed to reset screen"};
    }
}



