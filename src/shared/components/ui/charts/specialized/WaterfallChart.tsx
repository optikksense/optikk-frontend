import { useState, useMemo } from 'react';
import { Input } from '@/components/ui';

import { formatDuration } from '@shared/utils/formatters';

import { CHART_COLORS, STATUS_COLORS } from '@config/constants';

const KIND_COLORS: Record<string, string> = {
  SERVER: '#648FFF',
  CLIENT: '#785EF0',
  INTERNAL: '#6b7280',
  PRODUCER: '#06aed5',
  CONSUMER: '#73c991',
};

function kindColor(kind: string): string {
  return KIND_COLORS[(kind ?? '').toUpperCase()] ?? '#9ca3af';
}

interface WaterfallChartProps {
  spans?: WaterfallSpan[];
  onSpanClick?: (span: WaterfallSpan) => void;
  selectedSpanId?: string | null;
  criticalPathSpanIds?: Set<string>;
  errorPathSpanIds?: Set<string>;
}

interface WaterfallSpan {
  readonly span_id: string;
  readonly parent_span_id?: string | null;
  readonly start_time: string;
  readonly end_time: string;
  readonly service_name?: string;
  readonly operation_name?: string;
  readonly status?: string;
  readonly span_kind?: string;
  readonly kind_string?: string;
  readonly duration_ms?: number;
}

interface WaterfallTreeSpan extends WaterfallSpan {
  readonly depth: number;
}

export default function WaterfallChart({
  spans = [],
  onSpanClick,
  selectedSpanId,
  criticalPathSpanIds,
  errorPathSpanIds,
}: WaterfallChartProps) {
  const [hoveredSpanId, setHoveredSpanId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeService, setActiveService] = useState<string | null>(null);

  const { spanTree, traceStart, traceDuration } = useMemo(() => {
    if (!spans || spans.length === 0) {
      return { spanTree: [], traceStart: 0, traceEnd: 0, traceDuration: 0 };
    }

    const startTimes = spans.map((span) => new Date(span.start_time).getTime());
    const endTimes = spans.map((span) => new Date(span.end_time).getTime());
    const traceStart = Math.min(...startTimes);
    const traceEnd = Math.max(...endTimes);
    const traceDuration = traceEnd - traceStart;

    const childrenMap: Record<string, string[]> = {};
    const spanMap: Record<string, WaterfallSpan> = {};

    spans.forEach((span) => {
      spanMap[span.span_id] = span;
      if (!childrenMap[span.span_id]) childrenMap[span.span_id] = [];
    });

    spans.forEach((span) => {
      if (span.parent_span_id) {
        if (!childrenMap[span.parent_span_id]) childrenMap[span.parent_span_id] = [];
        childrenMap[span.parent_span_id].push(span.span_id);
      }
    });

    const roots = spans.filter((span) => !span.parent_span_id || !spanMap[span.parent_span_id]);
    const tree: WaterfallTreeSpan[] = [];
    const visited = new Set();

    const dfs = (spanId: string, depth: number) => {
      if (visited.has(spanId)) return;
      visited.add(spanId);
      const span = spanMap[spanId];
      if (!span) return;
      tree.push({ ...span, depth });
      const children = childrenMap[spanId] || [];
      children
        .map((id) => spanMap[id])
        .filter(Boolean)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .forEach((child) => dfs(child.span_id, depth + 1));
    };

    roots
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .forEach((root) => dfs(root.span_id, 0));

    return { spanTree: tree, traceStart, traceEnd, traceDuration };
  }, [spans]);

  const services = useMemo(() => {
    const s = new Set<string>();
    spanTree.forEach((sp) => sp.service_name && s.add(sp.service_name));
    return Array.from(s);
  }, [spanTree]);

  const filteredTree = useMemo(() => {
    return spanTree.filter((sp) => {
      const matchesSearch =
        !search ||
        (sp.service_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (sp.operation_name ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesService = !activeService || sp.service_name === activeService;
      return matchesSearch && matchesService;
    });
  }, [spanTree, search, activeService]);

  const getServiceColor = (serviceName: string, status: string) => {
    if (status === 'ERROR') return STATUS_COLORS.ERROR;
    const hash = (serviceName ?? '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CHART_COLORS[hash % CHART_COLORS.length];
  };

  const getBarStyle = (span: any, index: number) => {
    const startTime = new Date(span.start_time).getTime();
    const endTime = new Date(span.end_time).getTime();
    const leftPercent = traceDuration > 0 ? ((startTime - traceStart) / traceDuration) * 100 : 0;
    const widthPercent = traceDuration > 0 ? ((endTime - startTime) / traceDuration) * 100 : 0;
    const baseColor = getServiceColor(span.service_name || 'unknown', span.status);
    const backgroundStr = baseColor.startsWith('#')
      ? `linear-gradient(90deg, ${baseColor}, ${baseColor}dd)`
      : baseColor;
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 0.5)}%`,
      background: backgroundStr,
      animationDelay: `${Math.min(index * 0.05, 1.5)}s`,
    };
  };

  const getTimeAxisLabels = () => {
    const labels: string[] = [];
    for (let i = 0; i <= 5; i++) labels.push(formatDuration((traceDuration * i) / 5));
    return labels;
  };

  if (!spans || spans.length === 0) {
    return (
      <div className="py-[60px] text-center text-[color:var(--text-muted)] text-sm">
        No spans available
      </div>
    );
  }

  const timeLabels = getTimeAxisLabels();
  const hasCritical = criticalPathSpanIds && criticalPathSpanIds.size > 0;
  const hasErrorPath = errorPathSpanIds && errorPathSpanIds.size > 0;

  return (
    <div className="bg-[var(--glass-bg)] rounded-lg overflow-hidden">
      {/* Search + filter toolbar */}
      <div className="px-3 py-2.5 flex gap-2 items-center flex-wrap border-b border-[var(--glass-border)]">
        <Input
          placeholder="Search spans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ width: 200 }}
        />
        <div className="flex gap-1 flex-wrap">
          <span
            onClick={() => setActiveService(null)}
            className="px-2 py-0.5 rounded-xl text-[11px] cursor-pointer border border-[var(--glass-border)] text-[color:var(--text-secondary)]"
            style={{ background: activeService === null ? 'var(--glass-border)' : 'transparent' }}
          >
            All
          </span>
          {services.map((svc) => {
            const color = getServiceColor(svc, '');
            const isActive = activeService === svc;
            return (
              <span
                key={svc}
                onClick={() => setActiveService(isActive ? null : svc)}
                className="px-2 py-0.5 rounded-xl text-[11px] cursor-pointer"
                style={{
                  background: isActive ? `${color}22` : 'transparent',
                  border: `1px solid ${isActive ? color : 'var(--glass-border)'}`,
                  color: isActive ? color : 'var(--text-secondary)',
                }}
              >
                {svc}
              </span>
            );
          })}
        </div>
        {(hasCritical || hasErrorPath) && (
          <span className="text-[11px] text-[color:var(--text-muted)] ml-auto flex gap-2.5 items-center">
            {hasCritical && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-[3px] bg-[#f59e0b] rounded-sm inline-block" />
                Critical path
              </span>
            )}
            {hasErrorPath && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-[3px] bg-[#f04438] rounded-sm inline-block" />
                Error path
              </span>
            )}
          </span>
        )}
      </div>

      {/* Column header */}
      <div className="flex border-b-2 border-[var(--glass-border)] bg-[rgba(255,255,255,0.02)] sticky top-0 z-[1]">
        <div className="w-[300px] min-w-[300px] border-r border-[var(--glass-border)] p-3">
          <span className="text-[color:var(--text-primary)] font-semibold text-[12px] uppercase tracking-[0.5px] pl-2">
            Span
          </span>
        </div>
        <div
          className="w-[60px] min-w-[60px] border-r border-[var(--glass-border)] p-3 flex items-center justify-end"
        >
          <span className="text-[11px] font-semibold text-[color:var(--text-muted)] uppercase">%</span>
        </div>
        <div className="flex-1 relative p-3">
          <div className="flex justify-between items-center h-full">
            {timeLabels.map((label, idx) => (
              <span key={idx} className="text-[color:var(--text-muted)] text-[11px] font-medium">{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[600px] overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[var(--scrollbar-track)] [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)]">
        {filteredTree.map((span, index) => {
          const isCritical = criticalPathSpanIds?.has(span.span_id);
          const isError = errorPathSpanIds?.has(span.span_id);
          const isSelected = selectedSpanId === span.span_id;
          const durationPct = traceDuration > 0 ? ((span.duration_ms ?? 0) / traceDuration * 100).toFixed(1) : '—';
          const kind = ((span.kind_string || span.span_kind) ?? '').toUpperCase();

          let borderLeft = 'none';
          let rowBg = 'transparent';
          if (isSelected) {
            borderLeft = '3px solid var(--literal-hex-5e60ce)';
            rowBg = 'var(--literal-rgba-94-96-206-0p15)';
          } else if (isError) {
            borderLeft = '3px solid #f04438';
            rowBg = 'rgba(240,68,56,0.06)';
          } else if (isCritical) {
            borderLeft = '3px solid #f59e0b';
            rowBg = 'rgba(245,158,11,0.06)';
          }

          return (
            <div
              key={span.span_id}
              className="flex border-b border-[var(--glass-border)] cursor-pointer transition-[background-color] duration-150 hover:bg-[rgba(255,255,255,0.04)]"
              style={{ borderLeft, background: rowBg }}
              onClick={() => onSpanClick && onSpanClick(span)}
              onMouseEnter={() => setHoveredSpanId(span.span_id)}
              onMouseLeave={() => setHoveredSpanId(null)}
            >
              {/* Label */}
              <div className="w-[300px] min-w-[300px] border-r border-[var(--glass-border)]">
                <div
                  className="flex flex-col gap-0.5 py-2"
                  style={{ paddingLeft: `${span.depth * 16 + 8}px` }}
                >
                  <div className="flex items-center gap-1">
                    {kind && (
                      <span
                        className="text-[9px] font-bold tracking-[0.04em] px-1 py-px rounded-[3px] flex-shrink-0 leading-[14px]"
                        style={{
                          background: `${kindColor(kind)}22`,
                          color: kindColor(kind),
                        }}
                      >
                        {kind.slice(0, 3)}
                      </span>
                    )}
                    <span className="text-[color:var(--text-muted)] text-[11px] font-medium uppercase tracking-[0.3px]">
                      {span.service_name}
                    </span>
                  </div>
                  <span className="text-[color:var(--text-primary)] text-[13px] font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                    {span.operation_name}
                  </span>
                </div>
              </div>

              {/* Duration % */}
              <div className="w-[60px] min-w-[60px] border-r border-[var(--glass-border)] flex items-center justify-end px-2 text-[11px] text-[color:var(--text-muted)] tabular-nums">
                {durationPct}%
              </div>

              {/* Timeline bar */}
              <div className="flex-1 relative py-3">
                <div className="relative h-full">
                  <div
                    className="absolute h-6 rounded flex items-center justify-start px-1.5 min-w-[3px] cursor-pointer shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)] opacity-0 animate-[waterfall-bar-enter_0.4s_ease-out_forwards] hover:opacity-100 hover:scale-y-[1.15] hover:z-[5] hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-[opacity,transform,box-shadow] duration-200"
                    style={getBarStyle(span, index)}
                    title={`${span.operation_name} — ${formatDuration(span.duration_ms)}`}
                  >
                    <span className="text-white text-[10px] font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap overflow-hidden text-ellipsis">
                      {formatDuration(span.duration_ms)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
