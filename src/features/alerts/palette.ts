import { Bell, BellOff, Plus } from "lucide-react";
import { createElement } from "react";

import type { PaletteAction } from "@/app/layout/CommandPalette/types";
import { ROUTES } from "@/shared/constants/routes";

export const alertsPaletteActions: PaletteAction[] = [
  {
    id: "nav.alerts",
    label: "Go to alerts",
    keywords: ["alerts", "monitors", "incidents"],
    group: "navigation",
    hotkey: "g a",
    icon: createElement(Bell, { size: 16 }),
    perform: ({ navigate }) => {
      navigate(ROUTES.alerts);
    },
  },
  {
    id: "alerts.create",
    label: "Create alert",
    keywords: ["alerts", "new", "rule", "create", "monitor"],
    group: "feature",
    icon: createElement(Plus, { size: 16 }),
    perform: ({ navigate }) => {
      navigate(ROUTES.alertRuleNew);
    },
  },
  {
    id: "alerts.mute",
    label: "Mute rule…",
    keywords: ["alerts", "mute", "silence"],
    group: "feature",
    icon: createElement(BellOff, { size: 16 }),
    perform: ({ navigate }) => {
      navigate(ROUTES.alerts);
    },
  },
  {
    id: "alerts.ack",
    label: "Ack instance…",
    keywords: ["alerts", "ack", "acknowledge", "incident"],
    group: "feature",
    icon: createElement(Bell, { size: 16 }),
    perform: ({ navigate }) => {
      navigate(`${ROUTES.alerts}?tab=incidents`);
    },
  },
];
