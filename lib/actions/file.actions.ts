"use server";

import { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "@/lib/constants";
import { isAllowedMimeType, sanitizeFileName } from "@/lib/utils";
import fs from "fs/promises";
import {createWriteStream,createReadStream} from "fs";

import { revalidatePath } from "next/cache";
import path from "path";

import unzipper from "unzipper";
import { Transform} from "node:stream";
import {file} from "zod";

type UploadResult = {
    success: boolean;
    message: string;
    fileName?: string;
};

const findFileSafeName = async (folderName:string, fileName: string): Promise<string> => {
    const files = await fs.readdir(`${UPLOAD_DIR}/${folderName}`);

    files.forEach(function(file) {
        if(file.substring(file.indexOf("-") + 1) === fileName) {
            fileName = file;
        }
    });
    return fileName;
}


const upload = async (formData: FormData): Promise<UploadResult> => {
    try {
        const file = formData.get("file") as File;
        const clubName = formData.get("clubName") as string;
        const newFileName = formData.get("newFileName") as string;

        if (!file) {
            return { success: false, message: "No file uploaded" };
        }

        if(!clubName||!newFileName) {
            return { success: false, message: "No club or new file name provided" };
        }
        if (!isAllowedMimeType(file.type)) {
            return {
                success: false,
                message: `File type not allowed. Allowed types: ${Object.keys(
                    ALLOWED_TYPES
                ).join(", ")}`,
            };
        }

        if (file.size > MAX_FILE_SIZE) {
            return {
                success: false,
                message: `File size too large. Maximum size: ${
                    MAX_FILE_SIZE / (1024 * 1024)
                }MB`,
            };
        }

        const originalExtension = path.extname(file.name).toLowerCase();
        const allowedExtensions = ALLOWED_TYPES[file.type];
        if (!allowedExtensions.includes(originalExtension)) {
            return {
                success: false,
                message: `Invalid file extension. Expected: ${allowedExtensions.join(
                    ", "
                )}`,
            };
        }

        await deleteFile(clubName, newFileName);


        const timestamp = Date.now();
        const safeFileName = `${timestamp}-${sanitizeFileName(newFileName)}`;
        const filePath = path.join(`${UPLOAD_DIR}/${clubName}`, safeFileName);

        await fs.mkdir(`${UPLOAD_DIR}/${clubName}`, { recursive: true });
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await fs.writeFile(filePath, buffer);

        const stats = await fs.stat(filePath);
        if (stats.size !== file.size) {
            await fs.unlink(filePath);
            return { success: false, message: "File upload verification failed" };
        }

        revalidatePath("/");

        return {
            success: true,
            message: "File uploaded successfully",
            fileName: safeFileName,
        };
    } catch (error) {
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Unknown error occurred",
        };
    }
};

const downloadClubImages = async (folderName: string) => {

    const url = `${process.env.SERVER_URL}/download_images?folderName=${folderName}`
    await fetch(url).then(async (res) => {
        const data = await res.blob();
        const _testFile = new File([data], "images.zip", {
            type: "application/zip",
        });
        const formData = new FormData();
        formData.append('clubName', folderName);
        formData.append('file', _testFile);
        await upload(formData).then(async (result : UploadResult) => {
            const fileName : string = result.fileName ?? '';
            if (result?.success) {
               await unpackZip(folderName, fileName)
            }
        })
    })
}

const unpackZip = async (folderName: string, fileName:string) => {
    createReadStream(`${UPLOAD_DIR}/${folderName}/${fileName}`).pipe(unzipper.Parse())
    .on('entry', function (entry) {
        const filePath = path.basename(entry.path);
        const type = entry.type; // 'Directory' or 'File'
        if (type === "File") {
            entry.pipe(createWriteStream(`${UPLOAD_DIR}/${folderName}/${filePath}`)).on('finish', function () {
                console.log("File uploaded successfully");
            });
        }
    }).promise().then(async () => {
        await new Promise(f => setTimeout(f, 2000));
        await deleteFile(folderName, fileName);
    });
}

const deleteFile = async (folderName: string, fileName:string) => {
    try {
        const safeFileName: string = await findFileSafeName(folderName,fileName);
        const filePath = path.join(UPLOAD_DIR, folderName, safeFileName);
        await fs.unlink(filePath);
        revalidatePath("/");
    } catch (error) {
        console.error("Delete error:", error);
    }
};

const deleteFolder = async (folderName: string) => {
    try {
        const filePath = path.join(UPLOAD_DIR, folderName);
        await fs.rm(filePath, { recursive: true, force: true });
        await new Promise(f => setTimeout(f, 2000));

        revalidatePath("/");

    } catch (error) {
        console.error("Delete error:", error);
    }
};

export { upload, deleteFile, deleteFolder,downloadClubImages, unpackZip, findFileSafeName};
