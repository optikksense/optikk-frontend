import {
  Activity,
  Brain,
  Columns2,
  Layers,
  Network,
  RefreshCw,
  ScrollText,
  Server,
  Settings,
  Sun,
} from "lucide-react";
import { createElement } from "react";

import type { PaletteAction } from "@/app/layout/CommandPalette/types";
import { useAppStore } from "@store/appStore";

export const navigationPaletteActions: PaletteAction[] = [
  {
    id: "nav.home",
    label: "Go to Overview",
    keywords: ["home", "overview", "dashboard"],
    group: "navigation",
    hotkey: "g h",
    icon: createElement(Activity, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/overview");
    },
  },
  {
    id: "nav.errors",
    label: "Go to Errors",
    keywords: ["errors", "overview", "failures"],
    group: "navigation",
    icon: createElement(Activity, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/overview?tab=errors");
    },
  },
  {
    id: "nav.latency-analysis",
    label: "Go to Latency Analysis",
    keywords: ["latency", "analysis", "metrics"],
    group: "navigation",
    icon: createElement(Activity, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/metrics?tab=latency-analysis");
    },
  },
  {
    id: "nav.infrastructure",
    label: "Go to Infrastructure",
    keywords: ["infrastructure", "nodes", "kubernetes"],
    group: "navigation",
    icon: createElement(Server, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/infrastructure");
    },
  },
  {
    id: "nav.ai-overview",
    label: "Go to LLM Overview",
    keywords: ["ai", "llm", "observability", "overview", "dashboard"],
    group: "navigation",
    icon: createElement(Brain, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-observability");
    },
  },
  {
    id: "nav.ai-explorer",
    label: "Go to LLM Traces Explorer",
    keywords: ["ai", "llm", "traces", "explorer", "spans"],
    group: "navigation",
    icon: createElement(Layers, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-explorer");
    },
  },
  {
    id: "nav.ai-models",
    label: "Go to Model Catalog",
    keywords: ["ai", "llm", "models", "catalog", "comparison"],
    group: "navigation",
    icon: createElement(Network, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-models");
    },
  },
  {
    id: "nav.ai-conversations",
    label: "Go to AI Conversations",
    keywords: ["ai", "llm", "conversations", "sessions", "chat"],
    group: "navigation",
    icon: createElement(ScrollText, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-conversations");
    },
  },
  {
    id: "nav.settings",
    label: "Go to Settings",
    keywords: ["settings", "preferences"],
    group: "navigation",
    icon: createElement(Settings, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/settings");
    },
  },
  {
    id: "app.refresh",
    label: "Refresh Data",
    keywords: ["refresh", "reload", "data"],
    group: "settings",
    icon: createElement(RefreshCw, { size: 16 }),
    perform: () => {
      useAppStore.getState().triggerRefresh();
    },
  },
  {
    id: "app.toggle-theme",
    label: "Toggle Theme",
    keywords: ["theme", "dark", "light"],
    group: "settings",
    icon: createElement(Sun, { size: 16 }),
    perform: () => {
      const { theme, setTheme } = useAppStore.getState();
      setTheme(theme === "dark" ? "light" : "dark");
    },
  },
  {
    id: "app.toggle-density",
    label: "Toggle Compact Mode",
    keywords: ["density", "compact", "comfortable"],
    group: "settings",
    icon: createElement(Columns2, { size: 16 }),
    perform: () => {
      const { viewPreferences, setViewPreference } = useAppStore.getState();
      const current = viewPreferences?.density ?? "comfortable";
      setViewPreference("density", current === "comfortable" ? "compact" : "comfortable");
    },
  },
];
