"use client";

import { Button } from "@/components/ui/button";
import { createAuthClient } from "better-auth/client";
import { toast } from "sonner";

const authClient = createAuthClient();

export const GoogleSignInButton = () => {
    const handleGoogleSignIn = async () => {
        try {
            const result = await authClient.signIn.social({
                provider: "google",
            });

            if (result.error) {
                toast.error(result.error.message || "Google sign‑in failed");
                return;
            }

            toast("Signed in with Google");
        } catch (err) {
            toast.error("Something went wrong during Google sign‑in");
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleGoogleSignIn}
        >
            <img
                src="/assets/icons/google.png"
                alt="Google"
                className="h-5 w-5"
            />
            Continue with Google
        </Button>
    );
};