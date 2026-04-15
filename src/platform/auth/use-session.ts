import { useQuery } from "@tanstack/react-query"

import { authClient } from "@/platform/auth/auth-client"

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  })
}
