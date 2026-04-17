import { Tabs } from "@/components/ui";
import { memo } from "react";

type TabKey = "timeline" | "flamegraph";

const TAB_ITEMS = [
  { key: "timeline", label: "Trace Timeline" },
  { key: "flamegraph", label: "Flamegraph" },
] as const;

interface Props {
  activeTab: TabKey;
  onChange: (next: TabKey) => void;
}

function VisualizationTabsComponent({ activeTab, onChange }: Props) {
  return (
    <Tabs
      activeKey={activeTab}
      onChange={(next) => onChange(next as TabKey)}
      items={TAB_ITEMS}
      size="lg"
      className="mt-4 mb-4"
    />
  );
}

export const VisualizationTabs = memo(VisualizationTabsComponent);
export type { TabKey };
