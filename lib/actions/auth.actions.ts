'use server';

import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {addUserInfo, deleteUserInfo, saveUserInfo} from "@/lib/actions/user.actions";
import {redirect} from "next/navigation";

export const signUpWithEmail = async ({email, password, fullName, phoneNumber, clubName, clubType, role}:SignUpFormData) => {
    try {
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
    }   catch (e) {
        console.log('Sign in failed', e);
        return {
            success: false,
            error: 'Sign in failed: ' + e.message,
        }
    }
}

export async function deleteUserAction(password: string) {
    try {

        await deleteUserInfo();
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
