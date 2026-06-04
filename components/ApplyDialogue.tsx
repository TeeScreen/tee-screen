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
    DialogTrigger,
} from "@/components/ui/dialog";
import {applyScreenChange, getUserInfo, resetScreenChange} from "@/lib/actions/user.actions";
import {  previewScreenChanges, confirmScreenChanges } from "@/lib/actions/file.actions";
import { toast } from "sonner";
import { useDirtyState } from "@/stores/user-store";
import { Loader2, CheckCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { CopyConfirmDialog, PreviewResult } from "@/components/screen/CopyConfirmDialog";

export function ApplyDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { dirty, setDirty } = useDirtyState();

    const [pendingPreviews, setPendingPreviews] = useState<PreviewResult[] | null>(null);
    const [sourceFolder, setSourceFolder] = useState<string>();

    async function handleConfirm() {
        setIsLoading(true);

        const result = await applyScreenChange();

        if (result.success) {
            toast("Applied changes successfully. Returning to screen page");
            setDirty(false);
        } else {
            toast("Failed to apply changes. Returning to screen page");
        }

        setIsLoading(false);
        setOpen(false);
        redirect("/dashboard/home");
    }

    async function handlePreview() {
        setIsLoading(true);

        const userinfo = await getUserInfo();
        const res = await previewScreenChanges([`${userinfo?.loadedScreen}`]); // pass your current screen(s)
        setIsLoading(false);

        if (res.success && res.previews && res.sourceFolder) {
            setPendingPreviews(res.previews);
            setSourceFolder(res.sourceFolder);
            setOpen(false); // close normal dialog
        } else {
            toast.error(res.message || "Preview failed");
        }
    }

    async function handleConfirmPreview(previews: PreviewResult[]) {
        setIsLoading(true);
        const res = await confirmScreenChanges(previews, sourceFolder);

        await resetScreenChange();
        setIsLoading(false);

        if (res.success) {
            toast.success(res.message || "Changes applied");
            setDirty(false);
            setPendingPreviews(null);
            redirect("/dashboard/home");
        } else {
            toast.error(res.message || "Failed to apply changes");
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !isLoading && setOpen(v)}>
                <DialogTrigger asChild>
                    <div>
                        <Button
                            variant="default"
                            disabled={!dirty || isLoading}
                            className="inline-flex sm:hidden p-2"
                            aria-label="Apply changes"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                        </Button>

                        <Button
                            variant="default"
                            disabled={!dirty || isLoading}
                            className="hidden sm:inline-flex"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                "Apply Changes"
                            )}
                        </Button>
                    </div>
                </DialogTrigger>

                <DialogContent className="max-w-[90%] sm:max-w-md p-4 sm:p-6 rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg font-semibold">
                            Apply Changes?
                        </DialogTitle>
                        <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                            This will update the active screen with your latest changes.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handlePreview}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            Preview Changes
                        </Button>

                        <Button
                            variant="default"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full sm:w-auto"
                        >
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {isLoading ? "Applying..." : "Apply"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {pendingPreviews && sourceFolder && !isLoading && (
                <CopyConfirmDialog
                    sourceFolder={sourceFolder}
                    previews={pendingPreviews}
                    onConfirm={handleConfirmPreview}
                    onCancel={() => setPendingPreviews(null)}
                />
            )}
        </>
    );
}
