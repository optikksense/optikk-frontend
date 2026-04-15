import { create } from "zustand"

interface StreamItem {
  readonly id: string
  readonly message: string
  readonly timestamp: number
}

interface LiveTailState {
  readonly items: StreamItem[]
  readonly status: "idle" | "connecting" | "live" | "closed" | "error"
  readonly lagMs: number
  setStatus: (status: LiveTailState["status"]) => void
  pushItem: (item: StreamItem, maxItems: number) => void
  reset: () => void
}

export const useLiveTailStore = create<LiveTailState>((set) => ({
  items: [],
  status: "idle",
  lagMs: 0,
  setStatus: (status) => set({ status }),
  pushItem: (item, maxItems) =>
    set((state) => ({ items: [item, ...state.items].slice(0, maxItems), lagMs: 0 })),
  reset: () => set({ items: [], status: "idle", lagMs: 0 }),
}))
