// src/lib/better-auth/auth.ts (adjust path as needed)

import { betterAuth, type BetterAuthOptions, type Auth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

import { connectToDatabase } from "@/database/mongoose";

let authInstance: Auth<BetterAuthOptions> | null = null;

export const getAuth = async (): Promise<Auth<BetterAuthOptions>> => {
    if (authInstance) return authInstance;

    // 1. Connect to DB
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("Missing database connection");
    }

    // 2. Validate required env vars
    const secret = process.env.BETTER_AUTH_SECRET;
    const baseUrl = process.env.BETTER_AUTH_URL;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!secret || !baseUrl) {
        throw new Error("Missing BETTER_AUTH_SECRET or BETTER_AUTH_URL");
    }

    if (!googleClientId || !googleClientSecret) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
    }

    // 3. Create Better Auth instance with correct generic
    authInstance = betterAuth<BetterAuthOptions>({
        database: mongodbAdapter(db as any) as ReturnType<typeof mongodbAdapter>,

        secret,
        baseUrl,

        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },

        plugins: [nextCookies()],

        user: {
            changeEmail: {
                enabled: true,
                updateEmailWithoutVerification: true,
            },
            deleteUser: {
                enabled: true,
            },
        },

        socialProviders: {
            google: {
                prompt: "select_account",
                clientId: googleClientId,
                clientSecret: googleClientSecret,
            },
        },
    });

    return authInstance;
};

// Eager singleton export – guaranteed non‑null or throws on startup
export const auth = await getAuth();
