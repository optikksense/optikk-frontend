import { useMemo } from "react";
import { useDebounce } from "use-debounce";

import { useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { resolveTimeBounds } from "@shared/utils/timeBounds";

import { type SuggestionItem, getLogsSuggestions, getSuggestions } from "@shared/api/suggestions";

import type { ExplorerScope } from "../types/filters";

interface Args {
  readonly scope?: ExplorerScope;
  readonly field: string | null;
  readonly prefix: string;
  readonly enabled?: boolean;
}

const FIVE_MIN_MS = 5 * 60 * 1000;
const DEBOUNCE_MS = 150;

   
                                                                       
                                                                        
                                                                           
                          
   
export function useQuerySuggestions({ scope, field, prefix, enabled }: Args) {
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const bucket = Math.floor(endTime / FIVE_MIN_MS);
  const [debouncedPrefix] = useDebounce(prefix, DEBOUNCE_MS);
  const effectiveEnabled = (enabled ?? true) && field !== null && field.trim() !== "";
  const fetch = scope === "logs" ? getLogsSuggestions : getSuggestions;
  return useStandardQuery<SuggestionItem[]>({
    queryKey: [scope ?? "traces", "suggest", field ?? "none", debouncedPrefix, bucket],
    queryFn: () => fetch({ startTime, endTime, field: field as string, prefix: debouncedPrefix }),
    enabled: effectiveEnabled,
  });
}
