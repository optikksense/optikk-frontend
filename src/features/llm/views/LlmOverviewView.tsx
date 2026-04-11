import LlmOverviewPanel from "../components/LlmOverviewPanel";
import { useLlmExplorer } from "../hooks/useLlmExplorer";

export default function LlmOverviewView() {
  const { isLoading, summary, facets, trend, generations } = useLlmExplorer();

  return (
    <LlmOverviewPanel
      summary={summary}
      facets={facets}
      trend={trend}
      generations={generations}
      isLoading={isLoading}
    />
  );
}
