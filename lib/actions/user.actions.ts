"use server";

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {connectToDatabase} from "@/database/mongoose";
import {AccountData, UserInfoModel} from "@/database/models/user.model";
import {ScreenInfoModel} from "@/database/models/screen.model";
import {deleteFolder, downloadClubImages, uploadFolder} from "@/lib/actions/file.actions";
import {UPLOAD_DIR} from "@/lib/constants";
import fs from "fs/promises";
import {nowUnityIsoString} from "@/lib/helper";
import {broadcastScreenUpdate} from "@/lib/sse";

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
        await connectToDatabase();
        const userID: string = data.userId;

        const existingItem = await UserInfoModel.findOne({
            userId: userID,
        }).lean();

        if (existingItem) {
            return { success: false, error: 'User profile already exists' };
        }

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
        await connectToDatabase();
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
        const userInfo = await UserInfoModel.findOne({ userId }).lean();

        if (!userInfo) {
            return { success: false, error: "User info not found" };
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
    lastEdited?: Date | null;
    lastEditedBy?: string | null;
    lastEditedByName?: string | null;
}) {
    try {
        await connectToDatabase();
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) return null;

        const userId = session.user.id;

        // Split data into user-specific and screen-specific fields
        const { screenJson, analyticsJson, lastEdited, lastEditedBy, lastEditedByName, ...userFields } = data;

        const currentUserRecord = await UserInfoModel.findOneAndUpdate(
            { userId },
            { userId, ...userFields },
            { upsert: true, returnDocument: 'after' }
        ).lean();

        const screenName = userFields.loadedScreen !== undefined ? userFields.loadedScreen : currentUserRecord?.loadedScreen;
        const accountLogin = userFields.loadedAccount !== undefined ? userFields.loadedAccount : currentUserRecord?.loadedAccount;

        if (screenName && accountLogin && (screenJson !== undefined || analyticsJson !== undefined)) {
            const updateFields: any = {};
            if (screenJson !== undefined) updateFields.screenJson = screenJson;
            if (analyticsJson !== undefined) updateFields.analyticsJson = analyticsJson;
            if (lastEdited !== undefined) updateFields.lastEdited = lastEdited;
            if (lastEditedBy !== undefined) updateFields.lastEditedBy = lastEditedBy;
            if (lastEditedByName !== undefined) updateFields.lastEditedByName = lastEditedByName;

            await ScreenInfoModel.findOneAndUpdate(
                { screenName},
                updateFields,
                { upsert: true }
            );

            // 🔥 Notify all clients editing this screen
            broadcastScreenUpdate(screenName, {
                screen: screenName,
                editedBy: lastEditedBy ?? "0",
                editedByName: lastEditedByName ?? "Unknown",
                version: Date.now()
            });
        }

        revalidatePath("/");

        return { success: true, message: "UserData Saved Successfully" };
    } catch (error) {
        console.error("Error saving user Data:", error);
        throw new Error("Failed to save Data");
    }
}

export async function getUserInfo() {
    await connectToDatabase();
    if (!auth) {
        // If auth is not initialised, fail loudly and predictably.
        throw new Error("Auth module not initialised");
    }
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) return null;

    const userId: string = session.user.id;

    // Update user's lastActive timestamp asynchronously without blocking response
    UserInfoModel.updateOne({ userId }, { lastActive: new Date() }).catch((e) => {
        console.warn('Failed to update lastActive for user', e);
    });

    // Try to find existing user info
    let userObj: any = null;
    try {
        userObj = await UserInfoModel.findOne({ userId }).lean();
        if (!userObj) {
            const newDoc = new UserInfoModel({
                userId,
                fullName: session.user.name,
                phoneNumber: "",
                clubName: "",
                clubType: "",
                role: "",
                accountDetails: [],
                loadedAccount: "",
                loadedScreen: "",
            });
            await newDoc.save();
            userObj = newDoc.toObject();
        }
    } catch (e) {
        console.warn('Failed to fetch or create user info', e);
        return null;
    }

    // Fetch screenJson and analyticsJson from Screen collection if screen is loaded
    if (userObj.loadedScreen && userObj.loadedAccount) {
        try {
            const screenInfo = await ScreenInfoModel.findOne({
                screenName: userObj.loadedScreen
            }).lean();
            if (screenInfo) {
                userObj.screenJson = screenInfo.screenJson;
                userObj.analyticsJson = screenInfo.analyticsJson;
            } else {
                userObj.screenJson = null;
                userObj.analyticsJson = null;
            }
        } catch (e) {
            console.warn('Failed to fetch screen info', e);
            userObj.screenJson = null;
            userObj.analyticsJson = null;
        }
    } else {
        userObj.screenJson = null;
        userObj.analyticsJson = null;
    }

    return userObj ? JSON.parse(JSON.stringify(userObj)) : null;
}

export async function addAccountData(account: AccountData) {
    await connectToDatabase();
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
    }).lean();

    if (existing) {
        throw new Error(`Account login "${account.accountLogin}" already exists for this user.`);
    }
    // 2. Add new account
    const updated = await UserInfoModel.findOneAndUpdate(
        { userId },
        { $push: { accountDetails: account } },
        { returnDocument: 'after' }
    ).lean();


    return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function removeAccountData(accountLogin: string) {
    await connectToDatabase();
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
    ).lean();

    return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

export async function updateScreenJson(formData: FormData) {
    const raw = formData.get("json");
    if (!raw) return;

    const parsed = JSON.parse(raw as string);

    const userInfo = await getUserInfo();
    if (!userInfo) return;

    await saveUserInfo({
        screenJson: parsed,
        lastEdited: new Date(),
        lastEditedBy: userInfo.userId,
        lastEditedByName: userInfo.fullName,
    });
}

export async function applyScreenChange() {
    try {
        const userInfo = await getUserInfo();
        const data = userInfo.screenJson;

        // 1. Update timestamp
        data.lastEdited = nowUnityIsoString();

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
        await connectToDatabase();
        const userInfo = await getUserInfo();
        if (!userInfo) return { success: false, error: "No user found" };

        if (resetLoaded) {
            // Remove user from the screen's activeUsers list
            if (userInfo.loadedScreen && userInfo.loadedAccount) {
                await ScreenInfoModel.updateOne(
                    { screenName: userInfo.loadedScreen},
                    { $pull: { activeUsers: { userId: userInfo.userId } } }
                );
            }
            // Clear the user's loadedScreen
            await UserInfoModel.updateOne(
                { userId: userInfo.userId },
                { loadedScreen: "" }
            );

            broadcastScreenUpdate(userInfo.loadedScreen, {
                screen: userInfo.loadedScreen,
                editedBy: userInfo.userId ?? "0",
                editedByName: userInfo.fullName ?? "Unknown",
                version: Date.now(),
                message: "has left editing session",
            });
            revalidatePath("/");
            return { success: true };
        }

        // Discard/Reset changes for the loaded screen
        if (!userInfo.loadedScreen || !userInfo.loadedAccount) {
            return { success: false, error: "No screen loaded to reset" };
        }

        // Delete folder if folderName exists on the draft screen
        if (userInfo.screenJson?.FolderNameOnServer) {
            await deleteFolder(userInfo.screenJson.FolderNameOnServer);
        }

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

        // Save original/fresh JSONs back to the screen document
        await ScreenInfoModel.findOneAndUpdate(
            { screenName: screenData.name},
            {
                screenJson: screenData,
                analyticsJson: analyticsData,
                lastEdited: null,
                lastEditedBy: null,
                lastEditedByName: null,
            },
            { upsert: true }
        );

        if (screenData.FolderNameOnServer) {
            try {
                await downloadClubImages(screenData.FolderNameOnServer);
            } catch {
                console.warn("Failed to download club images");
            }
        }

        broadcastScreenUpdate(userInfo.loadedScreen, {
            screen: userInfo.loadedScreen,
            editedBy: userInfo.userId ?? "0",
            editedByName: userInfo.fullName ?? "Unknown",
            version: Date.now(),
            type: "reset",
            message: "reset screen changes",
        });


        revalidatePath("/");
        return { success: true, message: "Reset and refreshed screen" };
    } catch (e) {
        console.error("resetScreenChange error:", e);
        return { success: false, error: "Failed to reset screen" };
    }
}

export async function loadScreenAction(screenName: string) {
    await connectToDatabase();
    if (!auth) {
        throw new Error("Auth module not initialised");
    }
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) return { success: false, error: "No session" };

    const userId = session.user.id;

    // Fetch user info first
    const userInfo = await UserInfoModel.findOne({ userId }).lean();
    if (!userInfo) return { success: false, error: "User not found" };

    const loadedAccount = userInfo.loadedAccount;
    const account = userInfo.accountDetails?.find(
        (a: any) => a.accountLogin === loadedAccount
    );
    if (!account) {
        return { success: false, error: "No matching account found" };
    }

    // 1. Unload current screen for this user
    await resetScreenChange(true);

    // 2. Check if screen document exists in ScreenInfoModel
    let screenInfo = await ScreenInfoModel.findOne({
        screenName
    }).lean();

    if (!screenInfo || !screenInfo.screenJson) {
        // Fetch from API
        const screenRes = await fetch(
            `https://teescreenapp.com/api/screen_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${screenName}`
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

        // Save fresh screen data
        screenInfo = await ScreenInfoModel.findOneAndUpdate(
            { screenName: screenData.name },
            {
                screenName: screenData.name,
                screenJson: screenData,
                analyticsJson: analyticsData,
                lastEdited: null,
                lastEditedBy: null,
                lastEditedByName: null,
            },
            { upsert: true, new: true }
        ).lean();

        // Download images to tmp
        if (screenData.FolderNameOnServer) {
            try {
                await downloadClubImages(screenData.FolderNameOnServer);
            } catch {
                console.warn("Failed to download club images");
            }
        }
    }

    if (!screenInfo) {
        return { success: false, error: "Failed to initialize screen info" };
    }

    // Update user's loaded screen
    await UserInfoModel.updateOne(
        { userId },
        { loadedScreen: screenInfo.screenName }
    );

    // Add user to the screen's activeUsers list (avoid duplicates)
    await ScreenInfoModel.updateOne(
        { screenName: screenInfo.screenName},
        { $pull: { activeUsers: { userId } } }
    );
    await ScreenInfoModel.updateOne(
        { screenName: screenInfo.screenName},
        { $push: { activeUsers: { userId, fullName: userInfo.fullName, role: userInfo.role || 'Editor' } } }
    );

    broadcastScreenUpdate(screenInfo.screenName, {
        screen: screenInfo.screenName,
        editedBy: userInfo.userId ?? "0",
        editedByName: userInfo.fullName ?? "Unknown",
        version: Date.now(),
        type: "presence",
        message: "has joined editing session",
    });

    revalidatePath("/");
    return { success: true };
}

export async function getScreenStatus(screenName: string) {
    try {
        await connectToDatabase();
        if (!auth) return null;
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user) return null;

        const currentUserId = session.user.id;

        const screenInfo = await ScreenInfoModel.findOne({ screenName }).lean();

        // Read activeUsers directly from the screen document
        const activeUsers = (screenInfo?.activeUsers ?? []).map((u: any) => ({
            userId: u.userId,
            fullName: u.fullName,
            role: u.role || 'Editor',
            isCurrent: u.userId === currentUserId,
        }));

        return {
            lastEdited: screenInfo?.lastEdited ? screenInfo.lastEdited.toISOString() : null,
            lastEditedBy: screenInfo?.lastEditedBy || null,
            lastEditedByName: screenInfo?.lastEditedByName || null,
            activeUsers,
        };
    } catch (error) {
        console.error("Failed to get screen status:", error);
        return null;
    }
}

export async function addAccountAction(account: AccountData) {
    const res = await addAccountData(account);
    revalidatePath("/");
    revalidatePath("/pages/settings");
    return res;
}

export async function deleteAccountAction(accountLogin: string) {
    const userInfo = await getUserInfo();
    if (userInfo?.loadedAccount === accountLogin) {
        await resetScreenChange(true);
    }
    const res = await removeAccountData(accountLogin);
    revalidatePath("/");
    revalidatePath("/pages/settings");
    return res;
}

export async function loadAccountAction(login: string, password?: string) {
    let pw = password;
    if (!pw) {
        const userInfo = await getUserInfo();
        const acc = userInfo?.accountDetails?.find((a: any) => a.accountLogin === login);
        if (!acc) throw new Error("No password found for account " + login);
        pw = acc.accountPW;
    }

    await resetScreenChange(true);

    const response = await fetch(
        `https://teescreenapp.com/api/auth_accounts.php?user=${login}&password=${pw}`
    );
    const data = await response.json();

    await saveUserInfo({
        loadedAccount: login,
        screenNames: data,
    });

    revalidatePath("/");
    revalidatePath("/pages/settings");
}

export async function reloadAccountAction(login: string) {
    const userInfo = await getUserInfo();
    const acc = userInfo?.accountDetails?.find((a: any) => a.accountLogin === login);
    if (!acc) throw new Error("No matching account found for " + login);

    const response = await fetch(
        `https://teescreenapp.com/api/auth_accounts.php?user=${acc.accountLogin}&password=${acc.accountPW}`
    );
    const data = await response.json();

    await saveUserInfo({
        loadedAccount: login,
        screenNames: data,
    });

    revalidatePath("/");
    revalidatePath("/pages/settings");
}






