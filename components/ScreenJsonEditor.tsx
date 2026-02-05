"use client";

import { useRef } from "react";
import { JsonEditor } from "./JsonEditor";
import { Button } from "@/components/ui/button";

export function ScreenJsonEditor({ initialJson, action }: {
    initialJson: any;
    action: (formData: FormData) => void;
}) {
    const hiddenInputRef = useRef<HTMLInputElement>(null);

    return (
        <form action={action}>
            <JsonEditor
                value={initialJson}
                onChange={(updated) => {
                    if (hiddenInputRef.current) {
                        hiddenInputRef.current.value = JSON.stringify(updated);
                    }
                }}
            />

            <input
                ref={hiddenInputRef}
                type="hidden"
                name="json"
                defaultValue={JSON.stringify(initialJson)}
            />

            <Button type="submit" className="mt-4">
                Save JSON
            </Button>
        </form>
    );
}