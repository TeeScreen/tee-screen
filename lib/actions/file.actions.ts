"use server";

import { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "@/lib/constants";
import {getFileType, isAllowedMimeType, sanitizeFileName} from "@/lib/utils";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { revalidatePath } from "next/cache";
import { getUserInfo } from "./user.actions";

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

        const res = await fetch(`${process.env.SERVER_URL}/upload_tmp_file.php`, {
            method: "POST",
            body: phpForm,
        });

        if (!res.ok) {
            return { success: false, message: "Upload failed" };
        }

        const safeFileName = (await res.text()).trim();
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

export async function copyScreenChanges(targetScreens: string[]): Promise<{ success: boolean; message: string }> {
    try {
        if (!targetScreens || targetScreens.length === 0) {
            return { success: false, message: "No target screens provided" };
        }

        const userInfo = await getUserInfo();
        const sourceData = userInfo?.screenJson;

        if (!sourceData || !userInfo.loadedScreen) {
            return { success: false, message: "No loaded screen data to copy from" };
        }

        for (const targetScreen of targetScreens) {
            try {
                const cloned = {
                    ...sourceData,
                    name: targetScreen,
                    lastEdited: new Date().toISOString(),
                };

                const json = JSON.stringify(cloned);
                const jsonBlob = new Blob([json], { type: "application/json" });

                const form = new FormData();
                form.append("file", jsonBlob, `${targetScreen}.json`);

                const res = await fetch(`${process.env.SERVER_URL}/upload_golf_course.php`, {
                    method: "POST",
                    body: form,
                });

                if (!res.ok) {
                    console.error(`Failed to copy to ${targetScreen}:`, res.statusText);
                    return { success: false, message: `Failed to copy to ${targetScreen}` };
                }
            } catch (err) {
                console.error(`Error copying to ${targetScreen}:`, err);
                return { success: false, message: `Error copying to ${targetScreen}` };
            }
        }

        revalidatePath("/");
        return { success: true, message: "Changes copied successfully" };
    } catch (e) {
        console.error("copyScreenChanges error:", e);
        return { success: false, message: e instanceof Error ? e.message : "Unknown error" };
    }
}




export {
    upload,
    deleteFile,
    deleteFolder,
    downloadClubImages,
    findFileSafeName,
    uploadFolder,
    getScreenPreview,
};