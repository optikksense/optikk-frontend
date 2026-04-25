import { useState } from "react";

import { useTracesStore } from "../../../store/tracesStore";

/**
 * Visualization tab state. The active viz (flamegraph vs timeline) is persisted
 * via tracesStore so the choice sticks across trace navigations (B2); detail
 * drawer tab stays ephemeral.
 */
export function useTraceDetailTabs() {
  const activeTab = useTracesStore((s) => s.visualizationTab);
  const setActiveTab = useTracesStore((s) => s.setVisualizationTab);
  const [activeDetailTab, setActiveDetailTab] = useState("attributes");
  return { activeTab, setActiveTab, activeDetailTab, setActiveDetailTab };
}
