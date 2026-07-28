import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { getSessionDetail, getSessionsOverview, querySessions } from "../api/sessionsApi";
import { useLlmRange } from "./useLlmQueries";

export function useSessionsOverview() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "sessions", "overview", startTime, endTime],
    queryFn: () => getSessionsOverview({ startTime, endTime }),
  });
}

export function useSessions() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "sessions", "list", startTime, endTime],
    queryFn: () => querySessions({ startTime, endTime }),
  });
}

export function useSessionDetail(sessionId: string | null) {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "sessions", "detail", sessionId, startTime, endTime],
    queryFn: () => getSessionDetail(sessionId ?? "", { startTime, endTime }),
    enabled: Boolean(sessionId),
  });
}
