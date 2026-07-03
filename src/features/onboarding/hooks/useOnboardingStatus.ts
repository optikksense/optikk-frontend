import { useQuery } from "@tanstack/react-query";

import { useTeamId } from "@store/appStore";

import { type OnboardingStatus, getOnboardingStatus } from "../api/onboardingApi";

// Polls onboarding status every 3s until the collector is provisioned AND a
// first span has landed, then stops. Drives the welcome wizard's live steps.
export function useOnboardingStatus() {
  const teamId = useTeamId();
  return useQuery<OnboardingStatus>({
    queryKey: ["onboarding.status", teamId],
    queryFn: getOnboardingStatus,
    enabled: Boolean(teamId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.provisioned && data.first_span_at) return false;
      return 3000;
    },
  });
}
