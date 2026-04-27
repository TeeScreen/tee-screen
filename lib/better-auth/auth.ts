import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import type { Db } from "mongodb";
import { connectToDatabase } from "@/database/mongoose";

/**
 * Factory that builds a Better Auth instance bound to a specific Mongo Db.
 * Declared as a standalone function so TypeScript can infer the *exact*
 * return type (`Auth<O>` with the specific options `O`) and we can reuse
 * it as the cache variable's type — avoiding the `Auth<BetterAuthOptions>`
 * variance mismatch.
 */
const createAuth = (db: Db) =>
    betterAuth({
        database: mongodbAdapter(db as any),

        secret: process.env.BETTER_AUTH_SECRET,

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
                clientId: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            },
        },
    });

export type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

export const getAuth = async (): Promise<AuthInstance> => {
    if (authInstance) return authInstance;

    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) throw new Error("Missing database connection");

    authInstance = createAuth(db);
    return authInstance;
};

/**
 * Top-level awaited instance for direct imports.
 * Requires `"module": "esnext"` (or `"es2022"`) and `"target": "es2017"+`
 * in tsconfig.json so top-level `await` is allowed.
 *
 * If you can't enable top-level await (e.g. middleware/edge runtime),
 * remove this line and call `await getAuth()` where needed.
 */
export const auth: AuthInstance = await getAuth();