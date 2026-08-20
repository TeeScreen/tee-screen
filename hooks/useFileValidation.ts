import { useState } from "react";

export function useFileValidation() {
    const MAX_BYTES = 100 * 1024 * 1024; // 100MB
    const ALLOWED_EXTENSIONS = ["png", "mp4", "pdf"];

    function validate(file: File | null) {
        if (!file) {
            return {
                isValid: false,
                userMessage: "No file selected.",
                devMessage: "File object is null.",
                ext: null,
                type: null
            };
        }

        const ext = file.name.split(".").pop()?.toLowerCase() || "";

        // Extension check
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return {
                isValid: false,
                userMessage: "Unsupported file type — only PNG, MP4 or PDF allowed.",
                devMessage: `Extension '${ext}' is not in whitelist: ${ALLOWED_EXTENSIONS.join(", ")}`,
                ext,
                type: null
            };
        }

        // Size check
        if (file.size > MAX_BYTES) {
            return {
                isValid: false,
                userMessage: "File too large — max size is 100MB.",
                devMessage: `File size ${file.size} exceeds max ${MAX_BYTES}.`,
                ext,
                type: null
            };
        }

        // Determine type
        const type =
            ext === "mp4" ? "video" :
                ext === "png" ? "image" :
                    ext === "pdf" ? "document" :
                        null;

        return {
            isValid: true,
            userMessage: null,
            devMessage: "File passed validation.",
            ext,
            type
        };
    }

    return { validate };
}
