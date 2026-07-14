"use server";

import { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "@/lib/constants";
import {getFileType, isAllowedMimeType, sanitizeFileName} from "@/lib/utils";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { revalidatePath } from "next/cache";
import { getUserInfo } from "./user.actions";
import {toUnityIsoString} from "@/lib/helper";
import {broadcastScreenUpdate} from "@/lib/sse";
import {ScreenInfoModel} from "@/database/models/screen.model";
import {UserInfoModel} from "@/database/models/user.model";

type UploadResult = {
    success: boolean;
    message: string;
    fileName?: string;
};

// Ensure /tmp/uploads exists
async function ensureBaseDir() {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

const findFileSafeName = async (folderName: string, fileName: string): Promise<string> => {
    try {
        const url = `${process.env.SERVER_URL}/get_safefilename.php?folderName=${encodeURIComponent(
            folderName
        )}&fileName=${encodeURIComponent(fileName)}`;
        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
            return fileName; // fallback to original
        }

        const text = await res.text();
        const safe = text.trim();

        // If PHP returned an empty string, fallback
        if (!safe) {
            return fileName;
        }

        return safe;
    } catch {
        return fileName;
    }
};

const upload = async (formData: FormData): Promise<UploadResult> => {
    try {
        const file = formData.get("file") as File;
        const folderName = formData.get("folderName") as string;
        let newFileName = formData.get("newFileName") as string;

        if (!file) return { success: false, message: "No file uploaded" };
        if (!folderName) return { success: false, message: "No folder name provided" };

        if (!newFileName) newFileName = file.name;

        // Ensure extension
        if (!newFileName.includes(".")) {
            const ext = path.extname(file.name).toLowerCase();
            const type = getFileType(ext);
            if (type === "image") newFileName += ".png";
            if (type === "video") newFileName += ".mp4";
        }

        // Build form for PHP
        const phpForm = new FormData();
        phpForm.append("folderName", folderName);
        phpForm.append("file", file, newFileName);

        await deleteFile(folderName, newFileName);
        const res = await fetch(`${process.env.SERVER_URL}/upload_tmp_file.php`, {
            method: "POST",
            body: phpForm,
        });

        // ---------- NEW: explicit status handling ----------
        if (res.status === 413) {
            return { success: false, message: "File too large (413)" };
        }

        if (res.status === 408) {
            return { success: false, message: "Upload timed out (408)" };
        }

        if (!res.ok) {
            return { success: false, message: `Upload failed (${res.status})` };
        }

        if (!res.ok) {
            return { success: false, message: "Upload failed" };
        }

        const safeFileName = (await res.text()).trim();
        await triggerUpdateEvent(newFileName, true);

        revalidatePath("/");

        return {
            success: true,
            message: "File uploaded",
            fileName: safeFileName,
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

const downloadClubImages = async (folderName: string) => {
    const url = `${process.env.SERVER_URL}/download_tmp?folderName=${folderName}`;
    await fetch(url);
}

const deleteFile = async (folderName: string, fileName: string) => {
    try {
        const safe = await findFileSafeName(folderName, fileName);

        const url = `${process.env.SERVER_URL}/delete_tmp_file.php?folderName=${encodeURIComponent(
            folderName
        )}&fileName=${encodeURIComponent(safe)}`;

        await fetch(url, { method: "GET" });
        await triggerUpdateEvent(fileName, false);
        revalidatePath("/");
    } catch (error) {
        console.error("Delete error:", error);
    }
};

const deleteFolder = async (folderName: string) => {
    try {
        const url = `${process.env.SERVER_URL}/delete_tmp_folder.php?folderName=${encodeURIComponent(
            folderName
        )}`;

        await fetch(url, { method: "GET" });

        revalidatePath("/");
    } catch (error) {
        console.error("Delete error:", error);
    }
};

const uploadFolder = async (
    folderName: string
): Promise<{ success: boolean; message: string }> => {
    try {
        if (!folderName) {
            return { success: false, message: "No folder name provided" };
        }

        const url = `${process.env.SERVER_URL}/upload_tmp.php?folderName=${encodeURIComponent(
            folderName
        )}`;

        const res = await fetch(url, { method: "GET" });

        if (!res.ok) {
            return { success: false, message: "Failed to restore folder from tmp" };
        }

        const text = (await res.text()).trim();

        revalidatePath("/");

        return {
            success: true,
            message: text || "Folder restored successfully",
        };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

const getScreenPreview = async (screenName: string): Promise<string | null> => {
    try {
        const url = `${process.env.SERVER_URL}/screen_preview.php?filename=${screenName}.json`;

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return null;

        const text = await res.text();
        return `${process.env.SERVER_URL}/${text}`.trim(); // this is already a URL returned by PHP
    } catch {
        return null;
    }
}

export async function previewScreenChanges(targetScreens: string[]) {
    const userInfo = await getUserInfo();
    const sourceData = userInfo?.screenJson;
    if (!sourceData) return { success: false, message: "No source data" };
    const sourceFolder = sourceData.FolderNameOnServer;
    const previews = [];

    const accounts = userInfo?.accountDetails || [];
    const loadedAccount = userInfo?.loadedAccount || null;
    const account = accounts.find(
        (a: any) => a.accountLogin === loadedAccount
    );

    // Fetch uploaded files (those starting with U)
    const filesRes = await fetch(
        `${process.env.SERVER_URL}/get_tmp_changes?screen=${sourceFolder}`
    );
    const files = filesRes.ok ? await filesRes.json() : [];

    for (const targetScreen of targetScreens) {

        const res = await fetch(
            `https://teescreenapp.com/api/screen_data?user=${account.accountLogin}&password=${account.accountPW}&screen=${targetScreen}`,
        );
        if (!res.ok) continue;
        const originalJson = await res.json();

        const { merged, diffs } = deepDiffMerge(originalJson, sourceData);
        previews.push({ targetScreen, diffs, merged, files });
    }

    return { success: true, previews, sourceFolder};
}


export async function confirmScreenChanges(
    previews: { targetScreen: string; merged: any }[], sourceFolder?: string
) {
    for (const { targetScreen, merged } of previews) {
        merged.lastEdited = toUnityIsoString();

        const blob = new Blob([JSON.stringify(merged)], { type: "application/json" });
        const form = new FormData();
        form.append("file", blob, `${targetScreen}.json`);

        const uploadRes = await fetch(
            `${process.env.SERVER_URL}/upload_golf_course.php`,
            {
                method: "POST",
                body: form,
            }
        );

        if (!uploadRes.ok) {
            return { success: false, message: `Failed to copy to ${targetScreen}` };
        }

        if(sourceFolder) {
            // Optionally trigger your PHP script that processes tmp folder
            const processRes = await fetch(
                `${process.env.SERVER_URL}/upload_changes_tmp?source=${sourceFolder}&target=${merged.FolderNameOnServer}`
            );
            console.log(processRes);
            if (!processRes.ok) {
                return { success: false, message: `Failed to process files for ${targetScreen}: ${processRes.body}` };
            }
        }
        broadcastScreenUpdate(targetScreen, {
            screen: targetScreen,
            editedBy: merged.lastEditedBy ?? "0",
            editedByName: merged.lastEditedByName ?? "Unknown",
            version: Date.now(),
            message: "applied changes to " + targetScreen,
        });

    }


    revalidatePath("/");
    return { success: true, message: "Changes copied successfully" };
}


export type PreviewResponse = {
    success: boolean;
    previews?: any[];
    message?: string;
    sourceFolder: string;
};


export type DiffEntry = {
    path: string;       // e.g. "holesData[0].yardsToHole"
    oldValue: any;
    newValue: any;
};

function deepDiffMerge(
    original: Record<string, any>,
    modified: Record<string, any>,
    skipKeys: string[] = ["name", "FolderNameOnServer", "GolfCourseLatLon" , "CourseLogoURL",
        "CourseOverviewURL", "AccountsThatHaveAccess", "CourseName", "lastEdited"],
    path: string = ""
): { merged: Record<string, any>; diffs: DiffEntry[] } {
    const result: Record<string, any> = { ...original };
    const diffs: DiffEntry[] = [];

    for (const key of Object.keys(modified)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (skipKeys.includes(key)) {
            result[key] = original[key]; // preserve
            continue;
        }

        const origVal = original[key];
        const modVal = modified[key];
        if (typeof modVal === "object" && modVal !== null && !Array.isArray(modVal)) {
            const { merged, diffs: childDiffs } = deepDiffMerge(
                origVal || {},
                modVal,
                skipKeys,
                currentPath
            );
            result[key] = merged;
            diffs.push(...childDiffs);
        } else if (Array.isArray(modVal)) {
            if (JSON.stringify(origVal) !== JSON.stringify(modVal)) {
                result[key] = modVal;
                diffs.push({ path: currentPath, oldValue: origVal, newValue: modVal });
            }
        } else {
            if (origVal !== modVal) {
                result[key] = modVal;
                diffs.push({ path: currentPath, oldValue: origVal, newValue: modVal });
            }
        }
    }

    return { merged: result, diffs };
}

async function triggerUpdateEvent(fileName: string, upload: boolean)
{
    const userInfo = await getUserInfo();
    if (!userInfo) return;
    let message;
    if(fileName)
    {
        if(upload)
        {
            message = `has uploaded a new ${fileName}`;
        }
        else {
            message = `has deleted ${fileName}`;
        }
    }

    broadcastScreenUpdate(userInfo.loadedScreen, {
        screen: userInfo.loadedScreen,
        editedBy: userInfo.userId ?? "0",
        editedByName: userInfo.fullName ?? "Unknown",
        version: Date.now(),
        message: message,
    });
}


export {
    upload,
    deleteFile,
    deleteFolder,
    downloadClubImages,
    findFileSafeName,
    uploadFolder,
    getScreenPreview,
    triggerUpdateEvent
};