import { authClient } from "@/platform/auth/auth-client"
import { useStandardQuery } from "@shared/hooks/useStandardQuery"

export function useSession() {
  return useStandardQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
    staleTime: 60_000,
  })
}
