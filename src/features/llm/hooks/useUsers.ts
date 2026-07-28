import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { getUsersOverview, queryUsers } from "../api/usersApi";
import { useLlmRange } from "./useLlmQueries";

export function useUsersOverview() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "users", "overview", startTime, endTime],
    queryFn: () => getUsersOverview({ startTime, endTime }),
  });
}

export function useUsers() {
  const { startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "users", "list", startTime, endTime],
    queryFn: () => queryUsers({ startTime, endTime }),
  });
}
