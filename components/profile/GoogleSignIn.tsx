"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createAuthClient } from "better-auth/client";
import { toast } from "sonner";

const authClient = createAuthClient();

export const GoogleSignInButton = () => {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);

            const result = await authClient.signIn.social({
                provider: "google",
            });

            if (result.error) {
                toast.error(result.error.message || "Google sign‑in failed");
                setLoading(false);
                return;
            }

            toast("Signed in with Google");
        } catch (err) {
            toast.error("Something went wrong during Google sign‑in");
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
        >
            {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-transparent" />
            ) : (
                <img
                    src="/assets/icons/google.png"
                    alt="Google"
                    className="h-5 w-5"
                />
            )}

            {loading ? "Signing in..." : "Continue with Google"}
        </Button>
    );
};
