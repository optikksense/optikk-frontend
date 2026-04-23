import { useMemo } from "react";
import { useDebounce } from "use-debounce";

import { useTimeRange } from "@app/store/appStore";
import { resolveTimeBounds } from "@/features/explorer/utils/timeRange";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { fetchSuggestions, type SuggestionItem } from "../search/suggestApi";

interface Args {
  readonly field: string | null;
  readonly prefix: string;
  readonly enabled?: boolean;
}

const FIVE_MIN_MS = 5 * 60 * 1000;
const DEBOUNCE_MS = 150;

/**
 * Fetches top-K values for a field given the current prefix. Prefix is
 * debounced 150ms so rapid typing doesn't fire a request per keystroke.
 * Cache is keyed on a 5-min time bucket so unrelated typing doesn't thrash
 * the query cache either.
 */
export function useQuerySuggestions({ field, prefix, enabled }: Args) {
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const bucket = Math.floor(endTime / FIVE_MIN_MS);
  const [debouncedPrefix] = useDebounce(prefix, DEBOUNCE_MS);
  const effectiveEnabled = (enabled ?? true) && field !== null && field.trim() !== "";
  return useStandardQuery<SuggestionItem[]>({
    queryKey: ["traces", "suggest", field ?? "none", debouncedPrefix, bucket],
    queryFn: () => fetchSuggestions({ startTime, endTime, field: field as string, prefix: debouncedPrefix }),
    enabled: effectiveEnabled,
  });
}
