import type { PaletteAction } from "@/app/layout/CommandPalette/types";

export const logsPaletteActions: PaletteAction[] = [
  {
    id: "nav.logs",
    label: "Go to Logs",
    keywords: ["logs", "search", "tail", "events"],
    group: "navigation",
    hotkey: "g l",
    perform: ({ navigate }) => {
      navigate("/logs");
    },
  },
];
