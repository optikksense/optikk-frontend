import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { getScoreSummary } from "../api/scoresApi";
import { useLlmRange } from "./useLlmQueries";

export function useScoreSummary() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "scores", "summary", startTime, endTime],
    queryFn: () => getScoreSummary({ startTime, endTime }),
  });
}
