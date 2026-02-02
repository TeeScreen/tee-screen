import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScreenState {
    loaded: boolean
    screenName: string
    setLoad: (isLoaded:boolean) => void
    setName: (newScreen:string) => void

}

export const useScreen = create<ScreenState>()(
    persist((set) => ({
        loaded: false,
        screenName: '',
        setLoad: (isLoaded: boolean) => set((s) => ({ loaded: isLoaded})),
        setName: (newScreen: string) => set((s) => ({ screenName: newScreen}))}),
    { name: 'screen-storage' }))