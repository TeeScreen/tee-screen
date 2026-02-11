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
import { updateEmailAction } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

type EmailForm = {
    email: string;
    password: string;
};

export function ChangeEmailDialog() {
    const [open, setOpen] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EmailForm>({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: EmailForm) => {
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("password", data.password);

        const res = await updateEmailAction(formData);

        if (res?.success) {
            toast.success("Email updated successfully");
            setOpen(false);
        } else {
            toast.error(res?.error || "Failed to update email");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Change Email</Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col gap-2">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Change Email</DialogTitle>
                        <DialogDescription>
                            Enter your new email and confirm with your password.
                        </DialogDescription>
                    </DialogHeader>

                    <InputField
                        name="email"
                        label="New Email"
                        placeholder="example@email.com"
                        register={register}
                        error={errors.email}
                    />

                    <InputField
                        name="password"
                        label="Current Password"
                        placeholder="Enter your password"
                        type="password"
                        register={register}
                        error={errors.password}
                    />

                    <DialogFooter className="gap-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Updating..." : "Update Email"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}