"use client";

import { Button } from "@/components/ui/button";
import { usePreviewState } from "@/stores/user-store"; // adjust import path
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function PreviewTrigger() {
    const { preview, setPreview } = usePreviewState();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setPreview(!preview)}
            aria-label="Toggle Preview"
        >
            {preview ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
    );
}
