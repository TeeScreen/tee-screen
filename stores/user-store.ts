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

interface DirtyState {
    dirty: boolean
    setDirty: (isChanged: boolean) => void;
}

export const useDirtyState = create<DirtyState>()(
    persist((set) => ({
            dirty: false,
            setDirty: (isChanged: boolean) => set((s) => ({
                dirty: isChanged,
            })),
        }),
        { name: 'dirty-storage' }))