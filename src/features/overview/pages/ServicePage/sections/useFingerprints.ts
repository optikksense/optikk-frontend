import {
  type ErrorFingerprint,
  serviceDetailApi,
} from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useFingerprints(serviceName: string, limit = 20): {
  fingerprints: readonly ErrorFingerprint[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery<ErrorFingerprint[]>(
    "service-page-fingerprints",
    (_teamId, start, end) =>
      serviceDetailApi.listFingerprints(start, end, serviceName, limit),
    { extraKeys: [serviceName, limit], enabled }
  );

  const fingerprints = query.data ?? [];
  return { fingerprints, loading: query.isLoading && fingerprints.length === 0 };
}
