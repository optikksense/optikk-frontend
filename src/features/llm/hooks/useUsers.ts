import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { getUsersOverview, queryUsers } from "../api/usersApi";
import { useLlmRange } from "./useLlmQueries";

export function useUsersOverview() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "users", "overview", tenantId, startTime, endTime, refreshKey],
    queryFn: () => getUsersOverview({ startTime, endTime }),
  });
}

export function useUsers() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "users", "list", tenantId, startTime, endTime, refreshKey],
    queryFn: () => queryUsers({ startTime, endTime }),
  });
}
