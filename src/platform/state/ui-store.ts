import { create } from "zustand"

interface UiState {
  readonly sidebarCollapsed: boolean
  readonly timezone: string
  toggleSidebar: () => void
  setTimezone: (timezone: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  timezone: "local",
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTimezone: (timezone) => set({ timezone }),
}))
