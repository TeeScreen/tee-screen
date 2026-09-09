"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckEmailPage() {
    return (
        <>
            <h1 className="form-title">Check Your Email</h1>

            <div className="space-y-5 text-center">
                <p className="text-sm text-muted-foreground">
                    We’ve sent you a password reset link.
                    Please check your inbox and follow the instructions to continue.
                </p>

                <p className="text-sm text-muted-foreground">
                    If you don’t see the email, check your spam folder or try again later.
                </p>

                <Link href="/sign-in">
                    <Button className="w-full mt-5">
                        Return to Sign In
                    </Button>
                </Link>
            </div>
        </>
    );
}
