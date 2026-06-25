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
    externalEditVersion: number
    setDirty: (isChanged: boolean) => void
    bumpVersion: () => void
    bumpExternalVersion: () => void
}

export const useDirtyState = create<DirtyState>()(
    persist((set) => ({
            dirty: false,
            version: 0,
            externalEditVersion: 0,
            setDirty: (isChanged: boolean) => set((s) => ({
                dirty: isChanged,
                version: isChanged ? (s.version == 0 ? 1 : s.version + 1) : (s.version == 0 ? 1 : 0),
            })),
            bumpVersion: () => set((s) => ({ version: s.version + 1 })),
            bumpExternalVersion: () => set((s) => ({ externalEditVersion: s.externalEditVersion + 1 })),
        }),
        { name: 'dirty-storage' })
)

interface PreviewState {
    preview: boolean,
    setPreview: (isChanged: boolean) => void

}

export const usePreviewState = create<PreviewState>()(
    persist((set) => ({
            preview: false,
            setPreview: (isChanged: boolean) => set((s) => ({
                preview: isChanged
            })),
        }),
        { name: 'preview-storage' })
)