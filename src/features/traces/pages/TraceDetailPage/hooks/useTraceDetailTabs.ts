import { useState } from "react";

export function useTraceDetailTabs() {
  const [activeTab, setActiveTab] = useState<"timeline" | "flamegraph">("timeline");
  const [activeDetailTab, setActiveDetailTab] = useState("attributes");
  return { activeTab, setActiveTab, activeDetailTab, setActiveDetailTab };
}
