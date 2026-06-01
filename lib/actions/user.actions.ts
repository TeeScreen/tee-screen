"use server";

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {AccountData, UserInfoModel} from "@/database/models/user.model";
import {deleteFolder, downloadClubImages, uploadFolder} from "@/lib/actions/file.actions";
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
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
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
    analyticsJson?: any;
}) {
    try {
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) return null;

        const userId = session.user.id;

        await UserInfoModel.findOneAndUpdate(
            { userId },
            { userId, ...data },
            { upsert: true, returnDocument: 'after' }
        );

        revalidatePath("/");

        return { success: true, message: "UserData Saved Successfully" };
    } catch (error) {
        console.error("Error saving user Data:", error);
        throw new Error("Failed to save Data");
    }
}

export async function getUserInfo() {
    if (!auth) {
        // If auth is not initialised, fail loudly and predictably.
        throw new Error("Auth module not initialised");
    }
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) return null;

    const userId: string = session.user.id;

    // Try to find existing user info
    let user = await UserInfoModel.findOne({ userId });

    // If none exists, create a new one
    if (!user) {
        user = new UserInfoModel({
            userId,
            fullName: session.user.name,
            phoneNumber: "",
            clubName: "",
            clubType: "",
            role: "",
            accountDetails: [],
            loadedAccount: "",
            loadedScreen: "",
            screenJson: null,
        });

        await user.save();
    }

    return JSON.parse(JSON.stringify(user));
}

export async function addAccountData(account: AccountData) {
    if (!auth) {
        // If auth is not initialised, fail loudly and predictably.
        throw new Error("Auth module not initialised");
    }
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
    // 2. Add new account
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $push: { accountDetails: account } },
        { returnDocument: 'after' }
    );


    return JSON.parse(JSON.stringify(updated));
}

export async function removeAccountData(accountLogin: string) {
    if (!auth) {
        // If auth is not initialised, fail loudly and predictably.
        throw new Error("Auth module not initialised");
    }
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) redirect('/sign-in');

    const userId: string = session.user.id;
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $pull: { accountDetails: { accountLogin } } },
        { returnDocument: 'after' }
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

        // 3. Upload JSON to PHP
        const jsonForm = new FormData();
        jsonForm.append("file", jsonBlob, `${data.name}.json`);

        const jsonRes = await fetch(`${process.env.SERVER_URL}/upload_golf_course.php`, {
            method: "POST",
            body: jsonForm,
        });

        if (!jsonRes.ok) {
            throw new Error("Failed to upload JSON");
        }

        // ---------------------------------------------------------
        // STEP 2: RESTORE IMAGES FROM TMP → ORIGINAL
        // ---------------------------------------------------------
        const folderName = data.FolderNameOnServer;

        const restoreRes = await uploadFolder(folderName);

        if (!restoreRes.success) {
            throw new Error("Failed to restore images from tmp");
        }

        // ---------------------------------------------------------
        // STEP 3: CleanUp
        // ---------------------------------------------------------
        await resetScreenChange();

        // ---------------------------------------------------------
        // STEP 4: Revalidate UI
        // ---------------------------------------------------------
        revalidatePath("/");

        return { success: true };

    } catch (e) {
        console.error("applyScreenChange error:", e);
        return { success: false };
    }
}

export async function resetScreenChange(resetLoaded: boolean = false) {
    try {
        const userInfo = await getUserInfo();

        // Clean up any server folder tied to the current screen
        if (userInfo?.screenJson?.FolderNameOnServer) {
            await deleteFolder(userInfo.screenJson.FolderNameOnServer);
        }

        // Base reset payload
        const resetPayload: any = {
            screenJson: null,
            analyticsJson: null,
        };

        if (resetLoaded) {
            resetPayload.loadedScreen = "";
        }

        await saveUserInfo(resetPayload);

        // Reload fresh data if a loadedScreen exists
        if (!resetLoaded && userInfo.loadedScreen) {
            const account = userInfo.accountDetails?.find(
                (a: any) => a.accountLogin === userInfo.loadedAccount
            );
            if (!account) {
                return { success: false, error: "No account found" };
            }

            const screenRes = await fetch(
                `https://teescreenapp.com/api/screen_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${userInfo.loadedScreen}`
            );
            if (!screenRes.ok) {
                return { success: false, error: "Failed to fetch screen data" };
            }

            const screenData = await screenRes.json();

            let analyticsData: any = null;
            try {
                const analyticsRes = await fetch(
                    `https://teescreenapp.com/api/analytics_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenData.name}`
                );
                if (analyticsRes.ok) {
                    analyticsData = await analyticsRes.json();
                }
            } catch {
                console.warn("Analytics request failed");
            }

            await saveUserInfo({
                loadedScreen: screenData.name,
                screenJson: screenData,
                analyticsJson: analyticsData,
            });

            if (screenData.FolderNameOnServer) {
                try {
                    await downloadClubImages(screenData.FolderNameOnServer);
                } catch {
                    console.warn("Failed to download club images");
                }
            }

            revalidatePath("/");
        }

        return { success: true, message: "Reset and refreshed screen" };
    } catch (e) {
        console.error("resetScreenChange error:", e);
        return { success: false, error: "Failed to reset screen" };
    }
}




