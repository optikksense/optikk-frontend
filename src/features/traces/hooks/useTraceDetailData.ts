import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tracesService } from '@shared/api/tracesService';
import { normalizeSpan, normalizeTraceLog, calculateTraceStats } from '../utils/traceCalculations';

export function useTraceDetailData(selectedTeamId: number | null, traceIdParam: string) {
  const [searchParams] = useSearchParams();
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(() => searchParams.get('span') || null);

  // Sync span from URL on mount
  useEffect(() => {
    const spanFromUrl = searchParams.get('span');
    if (spanFromUrl) setSelectedSpanId(spanFromUrl);
  }, [searchParams]);

  // Fetch spans by root span_id or trace_id fallback
  const { data: spansData, isLoading: spansLoading } = useQuery({
    queryKey: ['span-tree', selectedTeamId, traceIdParam],
    queryFn: async () => {
      const bySpan = await tracesService.getSpanTree(selectedTeamId, traceIdParam);
      if (Array.isArray(bySpan) && bySpan.length > 0) return bySpan;
      return tracesService.getTraceSpans(selectedTeamId, traceIdParam);
    },
    enabled: !!selectedTeamId && !!traceIdParam,
  });

  const spans = useMemo(
    () => (Array.isArray(spansData) ? spansData : []).map(normalizeSpan),
    [spansData],
  );

  // Resolve actual trace_id
  const resolvedTraceId = spans.length > 0 ? (spans[0].trace_id || traceIdParam) : traceIdParam;

  // Fetch logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['trace-logs', selectedTeamId, resolvedTraceId],
    queryFn: () => tracesService.getTraceLogs(selectedTeamId, resolvedTraceId),
    enabled: !!selectedTeamId && !!resolvedTraceId,
  });

  const traceLogs = useMemo(
    () => (Array.isArray(logsData) ? logsData : []).map(normalizeTraceLog),
    [logsData],
  );

  const stats = useMemo(() => calculateTraceStats(spans), [spans]);
  const selectedSpan = useMemo(() => spans.find((s) => s.span_id === selectedSpanId), [spans, selectedSpanId]);

  return {
    spans,
    traceLogs,
    stats,
    selectedSpan,
    selectedSpanId,
    setSelectedSpanId,
    isLoading: spansLoading,
    logsLoading,
  };
}
