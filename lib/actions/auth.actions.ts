'use server';

import {auth} from "@/lib/better-auth/auth";
//import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";
import {addUserInfo, saveUserInfo} from "@/lib/actions/user.actions";

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
            error: 'Sign in failed'
        }
    }
}
