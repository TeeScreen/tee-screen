"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function CopyScreensDialog({
                                      screens,
                                      copyAction,
                                  }: {
    screens: string[];
    copyAction: (formData: FormData) => Promise<any>;
}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    function toggleScreen(screen: string) {
        setSelected((prev) =>
            prev.includes(screen) ? prev.filter((s) => s !== screen) : [...prev, screen]
        );
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await copyAction(formData);
        if (res?.success) {
            toast.success("Changes copied successfully");
            setOpen(false);
            setSelected([]);
        } else {
            toast.error("Failed to copy changes");
        }
        setIsLoading(false);
    }

    return (
        <>
            <Button variant="default" onClick={() => setOpen(true)}>
                Copy Changes
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Copy Changes</DialogTitle>
                        <DialogDescription>
                            Select screens to apply the current changes.
                        </DialogDescription>
                    </DialogHeader>

                    <form action={handleSubmit}>
                        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                            {screens.map((screen) => (
                                <label key={screen} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="selectedScreens"
                                        value={screen}
                                        checked={selected.includes(screen)}
                                        onChange={() => toggleScreen(screen)}
                                    />
                                    <span>{screen}</span>
                                </label>
                            ))}
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="default"
                                type="submit"
                                disabled={isLoading || selected.length === 0}
                            >
                                {isLoading ? "Copying..." : "Copy"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
