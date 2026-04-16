import type { MutableRefObject } from "react";
import { useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { TraceRecord } from "../../../types";
import { buildTraceTableColumns } from "../traceColumnDefs";

export function useTracesTableColumns(
  isLiveTail: boolean,
  selectedTraceIdsRef: MutableRefObject<string[]>,
  setSelectedTraceIds: Dispatch<SetStateAction<string[]>>
) {
  return useMemo(
    () => buildTraceTableColumns(isLiveTail, selectedTraceIdsRef, setSelectedTraceIds),
    [isLiveTail, selectedTraceIdsRef, setSelectedTraceIds]
  );
}
