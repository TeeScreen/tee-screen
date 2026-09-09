"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import { createAuthClient } from "better-auth/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const authClient = createAuthClient();

interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

export default function ResetPasswordPage() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    });

    // Watch both fields for validation state
    const newPassword = watch("newPassword");
    const confirmPassword = watch("confirmPassword");

    const isPasswordValid =
        newPassword &&
        newPassword.length >= 8 &&
        confirmPassword &&
        confirmPassword === newPassword &&
        !errors.newPassword &&
        !errors.confirmPassword;

    const onSubmit = async (data: ResetPasswordFormData) => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (!token) {
            toast.error("Missing token");
            return;
        }

        const res = await authClient.resetPassword({
            token,
            newPassword: data.newPassword,
        });

        if (res.error) {
            toast.error("Failed to reset password", {
                description: res.error.message ?? "Please try again.",
            });
        } else {
            toast.success("Password reset successfully");
            router.push("/sign-in");
        }
    };

    return (
        <>
            <h1 className="form-title">Reset Your Password</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="newPassword"
                    label="New Password"
                    placeholder="Enter a strong password"
                    type="password"
                    register={register}
                    error={errors.newPassword}
                    validation={{
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Minimum 8 characters",
                        },
                    }}
                />

                <InputField
                    name="confirmPassword"
                    label="Confirm New Password"
                    placeholder="Re-enter your new password"
                    type="password"
                    register={register}
                    error={errors.confirmPassword}
                    validation={{
                        required: "Please confirm your password",
                        validate: (value: string) =>
                            value === watch("newPassword") ||
                            "Passwords do not match",
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting || !isPasswordValid}
                    className="w-full mt-5"
                >
                    {isSubmitting ? "Resetting Password..." : "Reset Password"}
                </Button>
            </form>
        </>
    );
}
