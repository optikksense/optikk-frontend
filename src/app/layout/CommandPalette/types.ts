import type React from "react";

export interface PaletteActionContext {
  navigate: (path: string) => void;
}

export interface PaletteAction {
  id: string; // unique, stable - used for hotkey binding
  label: string;
  keywords: string[];
  icon?: React.ReactNode;
  group: "navigation" | "time" | "feature" | "settings";
  hotkey?: string;
  perform: (context: PaletteActionContext) => void;
  enabled?: () => boolean;
}
