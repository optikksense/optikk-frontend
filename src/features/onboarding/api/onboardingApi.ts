import api from "@/shared/api/api/client";
import { API_CONFIG } from "@config/apiConfig";

// Mirrors query's onboarding.StatusResponse. Timestamps are null until the
// first signal of each kind lands for the team.
export interface OnboardingStatus {
  readonly provisioned: boolean;
  readonly status: string;
  readonly slug: string;
  readonly api_key: string;
  readonly first_span_at: string | null;
  readonly first_log_at: string | null;
  readonly first_metric_at: string | null;
}

export function getOnboardingStatus(): Promise<OnboardingStatus> {
  return api.get<OnboardingStatus>(API_CONFIG.ENDPOINTS.ONBOARDING.STATUS);
}
