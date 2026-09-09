'use server';

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {addUserInfo, deleteUserInfo, saveUserInfo} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";

export const signUpWithEmail = async ({email, password, fullName, phoneNumber, clubName, clubType, role}:SignUpFormData) => {
    try {
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        const response = await auth.api.signUpEmail({
            body: {
                email:email,
                password:password,
                name: fullName,
            }
        })

        if(response?.user?.id){
            await addUserInfo({
                userId: response.user.id,
                fullName: fullName,
                phoneNumber: phoneNumber,
                clubName: clubName,
                clubType: clubType,
                role: role,
            });
        }

        return {
            success: true,
            data: response
        }
    }   catch (e) {
        console.log('Sign up failed', e);
        return {
            success: false,
            error: 'Sign up failed'
        }
    }
}

export const signOut = async () => {
    try {
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        await auth.api.signOut({headers: await headers()});
        return {
            success: true,
            message: 'Sign out sucessfull'
        }
    }catch (e) {
        console.log('Sign out failed', e);
        return {
            success: false,
            error: 'Sign out failed'
        }
    }
}

export const signInWithEmail = async ({email, password, rememberMe}:SignInFormData) => {
    try {
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        const response = await auth.api.signInEmail({
            body: {
                email: email,
                password: password,
                rememberMe: rememberMe,
            }
        })

        return {
            success: true,
            data: response
        }
    }   catch (e: unknown) {
        console.log("Sign in failed", e);

        const message =
            e instanceof Error ? e.message : "Unknown error occurred";

        return {
            success: false,
            error: "Sign in failed: " + message
        };
    }

}

export async function deleteUserAction(password: string) {
    try {

        await deleteUserInfo();
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        await auth.api.deleteUser({
            body: {
                password: password,
                callbackURL: "/sign-up",
            },
        });

        return { success: true };
    } catch (err: any) {
        return {
            error: err?.message ?? "Failed to delete account",
        };
    }
}



export async function updateEmailAction(formData: FormData) {
    try {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        await auth.api.verifyPassword({
            body: {
                password: password // required
            },
            headers: await headers() // headers containing the user's session token
        });

        await auth.api.changeEmail({
            body: {
                newEmail: email,
                callbackURL: "/sign-up",
            },

            headers: await headers(),
        });

        return { success: true };
    } catch (err) {
        console.error("Email update failed:", err);
        return { success: false, error: "Failed to update email" };
    }
}

export async function updatePasswordAction(formData: FormData) {
    const newPassword = formData.get("newPassword") as string;
    const password = formData.get("password") as string;

    try {
        if (!auth) {
            // If auth is not initialised, fail loudly and predictably.
            throw new Error("Auth module not initialised");
        }
        await auth.api.changePassword({
            body: {
                newPassword: newPassword,
                currentPassword: password,
                revokeOtherSessions: true,
            },

            headers: await headers(),
        });

        return { success: true };
    } catch (err) {
        console.error("Password update failed:", err);
        return { success: false, error: "Failed to update password" };
    }
}

export async function requestPasswordReset(email: string)
{
    try {
        if(!auth)
        {
            throw new Error("Auth module not initialised");
        }
        const data = await auth.api.requestPasswordReset({
            body: {
                email: email, // required, The email address of the user to send a password reset email to
                redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`, // The URL to redirect the user to reset their password. If the token isn't valid or expired, it'll be redirected with a query parameter `?error=INVALID_TOKEN`. If the token is valid, it'll be redirected with a query parameter `?token=VALID_TOKEN
            },
        });

        return { success: true };

    } catch(err)
    {
        console.error("Password reset request failed:", err);
        return { success: false, error: "Failed to request password reset" };
    }
}