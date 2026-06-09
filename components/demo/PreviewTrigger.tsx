"use client";

import { Button } from "@/components/ui/button";
import { usePreviewState } from "@/stores/user-store"; // adjust import path
import { Smartphone} from "lucide-react";

export function PreviewTrigger() {
    const { preview, setPreview } = usePreviewState();

    return (
        <Button
            variant={preview ? "default" : "outline"}
            size="icon"
            onClick={() => setPreview(!preview)}
            aria-label="Toggle Preview"

        >
            <Smartphone/>
        </Button>
    );
}
