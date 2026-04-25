import { useCallback, useMemo } from "react";

import { buildBodyProps } from "./buildBodyProps";
import { useTraceDetailActions } from "./useTraceDetailActions";
import { useTraceDetailHotkeys } from "./useTraceDetailHotkeys";
import { useTraceDetailState } from "./useTraceDetailState";

export function useTraceDetailPage() {
  const state = useTraceDetailState();
  const actions = useTraceDetailActions({
    resolvedTraceId: state.resolvedTraceId,
    traceTimeBounds: state.traceTimeBounds,
    setSelectedSpanId: state.data.setSelectedSpanId,
  });
  const bodyProps = useMemo(() => buildBodyProps(state, actions), [state, actions]);
  const errorSpanIds = useMemo(() => Array.from(state.enhanced.errorPathSpanIds), [state.enhanced.errorPathSpanIds]);
  const onSelectSpan = useCallback(
    (id: string) => actions.handleSpanClick({ span_id: id }),
    [actions],
  );
  useTraceDetailHotkeys({ traceId: state.resolvedTraceId, errorSpanIds, onSelectSpan });
  return { state, actions, bodyProps };
}
