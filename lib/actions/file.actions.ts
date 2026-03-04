"use server";

import { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "@/lib/constants";
import {getFileType, isAllowedMimeType, sanitizeFileName} from "@/lib/utils";
import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import { revalidatePath } from "next/cache";

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
        console.log(phpForm);

        const res = await fetch(`${process.env.SERVER_URL}/upload_tmp.php`, {
            method: "POST",
            body: phpForm,
        });

        if (!res.ok) {
            return { success: false, message: "Upload failed" };
        }

        const safeFileName = (await res.text()).trim();

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





export {
    upload,
    deleteFile,
    deleteFolder,
    downloadClubImages,
    findFileSafeName,
    uploadFolder,
};