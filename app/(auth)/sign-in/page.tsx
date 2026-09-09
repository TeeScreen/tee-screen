"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { requestPasswordReset, signInWithEmail } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GoogleSignInButton } from "@/components/profile/GoogleSignIn";
import { useState } from "react";

const SignIn = () => {
    const router = useRouter();
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        mode: "onBlur",
    });

    const emailValue = watch("email");

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);

            if (result.success) {
                toast("Sign in was successful");
                router.push("/");
            } else {
                toast.error(result.error);

                if (result.error?.toLowerCase().includes("password")) {
                    setShowForgotPassword(true);
                }
            }
        } catch {
            toast.error("Sign in failed unexpectedly");
        }
    };

    const forgotPassword = async () => {
        if (!emailValue) {
            toast.error("Enter your email first");
            return;
        }

        const result = await requestPasswordReset(emailValue);

        if (result.success) {
            toast("Password reset email sent");
            router.push("/check-email");
        } else {
            toast.error(result.error);
        }
    };

    return (
        <>
            <h1 className="form-title">Welcome back</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required",
                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Email address is required",
                    }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{ required: "Password is required" }}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full mt-5">
                    {isSubmitting ? "Signing In" : "Sign In"}
                </Button>

                {showForgotPassword && (
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={forgotPassword}
                    >
                        Forgot password?
                    </Button>
                )}

                <GoogleSignInButton />

                <FooterLink text="Don't have an account?" linkText="Create account" href="/sign-up" />
            </form>
        </>
    );
};

export default SignIn;
