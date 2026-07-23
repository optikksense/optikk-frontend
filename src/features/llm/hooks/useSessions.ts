import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { getSessionDetail, getSessionsOverview, querySessions } from "../api/sessionsApi";
import { useLlmRange } from "./useLlmQueries";

export function useSessionsOverview() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "sessions", "overview", tenantId, startTime, endTime, refreshKey],
    queryFn: () => getSessionsOverview({ startTime, endTime }),
  });
}

export function useSessions() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "sessions", "list", tenantId, startTime, endTime, refreshKey],
    queryFn: () => querySessions({ startTime, endTime }),
  });
}

export function useSessionDetail(sessionId: string | null) {
  const { tenantId, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "sessions", "detail", tenantId, sessionId, startTime, endTime],
    queryFn: () => getSessionDetail(sessionId ?? "", { startTime, endTime }),
    enabled: Boolean(sessionId),
  });
}
