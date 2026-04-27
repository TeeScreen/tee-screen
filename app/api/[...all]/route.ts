import { auth } from '@/lib/better-auth/auth'
import { toNextJsHandler } from 'better-auth/next-js'

if (!auth) {
    throw new Error("Auth instance is not initialized");
}

export const { GET, POST } = toNextJsHandler(auth.handler);
