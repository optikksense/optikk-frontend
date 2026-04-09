import {
  Activity,
  Brain,
  Columns2,
  Database,
  FlaskConical,
  Layers,
  Network,
  Play,
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
    id: "nav.ai-dashboard",
    label: "Go to AI Observability",
    keywords: ["ai", "llm", "observability"],
    group: "navigation",
    icon: createElement(Brain, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-observability");
    },
  },
  {
    id: "nav.ai-runs",
    label: "Go to LLM Runs",
    keywords: ["ai", "runs", "llm"],
    group: "navigation",
    icon: createElement(Play, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-runs");
    },
  },
  {
    id: "nav.ai-prompts",
    label: "Go to Prompts",
    keywords: ["ai", "prompts", "templates"],
    group: "navigation",
    icon: createElement(ScrollText, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-prompts");
    },
  },
  {
    id: "nav.ai-datasets",
    label: "Go to Datasets",
    keywords: ["ai", "datasets", "evaluation"],
    group: "navigation",
    icon: createElement(Database, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-datasets");
    },
  },
  {
    id: "nav.ai-experiments",
    label: "Go to Experiments",
    keywords: ["ai", "experiments", "variants", "evals"],
    group: "navigation",
    icon: createElement(FlaskConical, { size: 16 }),
    perform: ({ navigate }) => {
      navigate("/ai-experiments");
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
