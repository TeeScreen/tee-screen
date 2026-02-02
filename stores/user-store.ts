import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    userData: UserData
    setUser: (newUserData: UserData) => void;
}

export const useUserState = create<UserState>()(
    persist((set) => ({
        userData: {} as UserData,
        setUser: (newUserData: UserData) => set((s) => ({
            userData: newUserData,
        })),
    }),
    { name: 'user-storage' }))