"use server";

import { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "@/lib/constants";
import { isAllowedMimeType, sanitizeFileName } from "@/lib/utils";
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
        const folderPath = path.join(UPLOAD_DIR, folderName);
        const files = await fs.readdir(folderPath);

        for (const file of files) {
            if (file.substring(file.indexOf("-") + 1,file.indexOf(".") ) === fileName) {
                return file;
            }
        }
        return fileName;
    } catch {
        return fileName;
    }
};

const upload = async (formData: FormData): Promise<UploadResult> => {
    try {
        await ensureBaseDir();

        const file = formData.get("file") as File;
        const folderName = formData.get("folderName") as string;
        let newFileName = formData.get("newFileName") as string;

        if (!file) return { success: false, message: "No file uploaded" };
        if (!folderName) return { success: false, message: "No folder name provided" };

        if (!newFileName) newFileName = file.name;

        if (!isAllowedMimeType(file.type)) {
            return {
                success: false,
                message: `File type not allowed. Allowed: ${Object.keys(ALLOWED_TYPES).join(", ")}`,
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                message: `File too large. Max: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            };
        }

        const originalExtension = path.extname(file.name);
        const allowedExtensions = ALLOWED_TYPES[file.type];

        if (!allowedExtensions.includes(originalExtension.toLowerCase())) {
            return {
                success: false,
                message: `Invalid extension. Expected: ${allowedExtensions.join(", ")}`,
            };
        }

        await deleteFile(folderName, newFileName);

        const timestamp = Date.now();
        const safeFileName = `${timestamp}-${newFileName}`;
        const folderPath = path.join(UPLOAD_DIR, folderName);
        const filePath = path.join(folderPath, safeFileName);

        await fs.mkdir(folderPath, { recursive: true });

        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);

        const stats = await fs.stat(filePath);
        if (stats.size !== file.size) {
            await fs.unlink(filePath);
            return { success: false, message: "Upload verification failed" };
        }

        revalidatePath("/");

        return { success: true, message: "File uploaded", fileName: safeFileName };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

const downloadClubImages = async (folderName: string) => {
    const url = `${process.env.SERVER_URL}/download_images?folderName=${folderName}`;

    const res = await fetch(url);
    const blob = await res.blob();

    const zipFile = new File([blob], "images.zip", { type: "application/zip" });

    const formData = new FormData();
    formData.append("folderName", folderName);
    formData.append("file", zipFile);

    const result = await upload(formData);

    if (result.success && result.fileName) {
        await unpackZip(folderName, result.fileName);
    } else {
        console.log(result.message);
    }
};

const unpackZip = async (folderName: string, fileName: string) => {
    const zipPath = path.join(UPLOAD_DIR, folderName, fileName);
    const zipBuffer = await fs.readFile(zipPath);

    const zip = await JSZip.loadAsync(zipBuffer);
    const folderPath = path.join(UPLOAD_DIR, folderName);

    for (const [entryName, entry] of Object.entries(zip.files) as [string, JSZip.JSZipObject][]) {
        if (entry.dir) continue;

        const timestamp = Date.now();
        const cleanName = path.basename(entryName);
        const outPath = path.join(folderPath, `${timestamp}-${cleanName}`);

        const content = await entry.async("nodebuffer");
        await fs.writeFile(outPath, content);
    }

    await deleteFile(folderName, fileName);
};

const zipFolder = async (
    folderName: string
): Promise<{ success: boolean; zipName?: string; message: string }> => {
    try {
        const folderPath = path.join(UPLOAD_DIR, folderName);

        try {
            await fs.access(folderPath);
        } catch {
            return { success: false, message: "Folder does not exist" };
        }

        const timestamp = Date.now();
        const zipName = `${timestamp}-images.zip`;
        const zipPath = path.join(folderPath, zipName);

        const zip = new JSZip();
        const files = await fs.readdir(folderPath);

        for (const file of files) {
            if (file === zipName) continue;

            const filePath = path.join(folderPath, file);
            const stat = await fs.stat(filePath);

            if (!stat.isFile()) continue;

            const dashIndex = file.indexOf("-");
            const originalName = dashIndex !== -1 ? file.substring(dashIndex + 1) : file;

            const buffer = await fs.readFile(filePath);
            zip.file(originalName, buffer);
        }

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
        await fs.writeFile(zipPath, zipBuffer);

        return { success: true, zipName, message: "Folder zipped" };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown zip error",
        };
    }
};

const deleteFile = async (folderName: string, fileName: string) => {
    try {
        const safeFileName = await findFileSafeName(folderName, fileName);
        const filePath = path.join(UPLOAD_DIR, folderName, safeFileName);

        await fs.unlink(filePath);
        revalidatePath("/");
    } catch (error) {
        console.error("Delete error:", error);
    }
};

const deleteFolder = async (folderName: string) => {
    try {
        const folderPath = path.join(UPLOAD_DIR, folderName);
        await fs.rm(folderPath, { recursive: true, force: true });

        revalidatePath("/");
    } catch (error) {
        console.error("Delete error:", error);
    }
};

export {
    upload,
    deleteFile,
    deleteFolder,
    downloadClubImages,
    unpackZip,
    zipFolder,
    findFileSafeName,
};