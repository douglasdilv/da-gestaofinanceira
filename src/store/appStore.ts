import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppMode } from '@/types'

interface AppStore {
  mode: AppMode
  setMode: (mode: AppMode) => void
  currentDate: Date
  setCurrentDate: (date: Date) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      mode: 'personal',
      setMode: (mode) => set({ mode }),
      currentDate: new Date(),
      setCurrentDate: (date) => set({ currentDate: date }),
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'da-finance-app',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
)
