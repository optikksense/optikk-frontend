import type { PaletteAction } from "@/app/layout/CommandPalette/types";

export const tracePaletteActions: PaletteAction[] = [
  {
    id: "nav.traces",
    label: "Go to Traces",
    keywords: ["traces", "spans", "explorer", "distributed tracing"],
    group: "navigation",
    hotkey: "g t",
    perform: ({ navigate }) => {
      navigate("/traces");
    },
  },
];
