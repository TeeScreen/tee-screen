"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import InputField from "@/components/forms/InputField";
import { updatePasswordAction } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

type PasswordForm = {
    password: string;
    newPassword: string;
};

export function ChangePasswordDialog() {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<PasswordForm>({
        defaultValues: {
            password: "",
            newPassword: "",
        },
    });

    const onSubmit = async (data: PasswordForm) => {
        const formData = new FormData();
        formData.append("password", data.password);
        formData.append("newPassword", data.newPassword);

        const res = await updatePasswordAction(formData);

        if (res?.success) {
            toast.success("Password updated successfully");
            setOpen(false);
        } else {
            toast.error(res?.error || "Failed to update password");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col gap-2">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and choose a new one.
                        </DialogDescription>
                    </DialogHeader>

                    <InputField
                        name="password"
                        label="Current Password"
                        placeholder="Enter current password"
                        type="password"
                        register={register}
                        error={errors.password}
                    />

                    <InputField
                        name="newPassword"
                        label="New Password"
                        placeholder="Enter new password"
                        type="password"
                        register={register}
                        error={errors.newPassword}
                    />

                    <DialogFooter className="gap-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}