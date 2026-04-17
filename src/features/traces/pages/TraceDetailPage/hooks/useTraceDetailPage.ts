import { useMemo } from "react";

import { buildBodyProps } from "./buildBodyProps";
import { useTraceDetailActions } from "./useTraceDetailActions";
import { useTraceDetailState } from "./useTraceDetailState";

export function useTraceDetailPage() {
  const state = useTraceDetailState();
  const actions = useTraceDetailActions({
    resolvedTraceId: state.resolvedTraceId,
    traceTimeBounds: state.traceTimeBounds,
    setSelectedSpanId: state.data.setSelectedSpanId,
  });
  const bodyProps = useMemo(() => buildBodyProps(state, actions), [state, actions]);
  return { state, actions, bodyProps };
}
