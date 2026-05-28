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
    version: number
    setDirty: (isChanged: boolean) => void
    bumpVersion: () => void
}

export const useDirtyState = create<DirtyState>()(
    persist((set) => ({
            dirty: false,
            version: 0,
            setDirty: (isChanged: boolean) => set((s) => ({
                dirty: isChanged,
                version: isChanged ? (s.version == 0 ? 1 : s.version + 1) : (s.version == 0 ? 1 : 0),
            })),
            bumpVersion: () => set((s) => ({ version: s.version + 1 })),
        }),
        { name: 'dirty-storage' }))