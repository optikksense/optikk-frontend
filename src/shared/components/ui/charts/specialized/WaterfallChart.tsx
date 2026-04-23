import { Input } from "@/components/ui";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CHART_COLORS, STATUS_COLORS } from "@config/constants";
import { formatDuration } from "@shared/utils/formatters";
import { useMemo, useRef, useState } from "react";

const ROW_HEIGHT = 56;

const KIND_COLORS: Record<string, string> = {
  SERVER: "#648FFF",
  CLIENT: "#785EF0",
  INTERNAL: "#6b7280",
  PRODUCER: "#06aed5",
  CONSUMER: "#73c991",
};

function kindColor(kind: string): string {
  return KIND_COLORS[(kind ?? "").toUpperCase()] ?? "#9ca3af";
}

function serviceColor(serviceName: string, status: string): string {
  if (status === "ERROR") return STATUS_COLORS.ERROR;
  const hash = (serviceName ?? "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CHART_COLORS[hash % CHART_COLORS.length];
}

export interface WaterfallSpan {
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
  readonly leftPct: number;
  readonly widthPct: number;
  readonly barColor: string;
  readonly durationPct: string;
}

interface WaterfallChartProps {
  spans?: WaterfallSpan[];
  onSpanClick?: (span: WaterfallSpan) => void;
  selectedSpanId?: string | null;
  criticalPathSpanIds?: Set<string>;
  errorPathSpanIds?: Set<string>;
}

function buildSpanTree(spans: WaterfallSpan[]): { spanTree: WaterfallTreeSpan[]; services: string[]; traceDuration: number } {
  if (spans.length === 0) return { spanTree: [], services: [], traceDuration: 0 };
  const startTimes = spans.map((s) => new Date(s.start_time).getTime());
  const endTimes = spans.map((s) => new Date(s.end_time).getTime());
  const traceStart = Math.min(...startTimes);
  const traceDuration = Math.max(...endTimes) - traceStart;
  const spanMap: Record<string, WaterfallSpan> = {};
  const childrenMap: Record<string, string[]> = {};
  for (const s of spans) {
    spanMap[s.span_id] = s;
    childrenMap[s.span_id] ??= [];
    if (s.parent_span_id) { childrenMap[s.parent_span_id] ??= []; childrenMap[s.parent_span_id].push(s.span_id); }
  }
  const tree: WaterfallTreeSpan[] = [];
  const visited = new Set<string>();
  const dfs = (id: string, depth: number) => {
    if (visited.has(id)) return;
    visited.add(id);
    const s = spanMap[id];
    if (!s) return;
    const t0 = new Date(s.start_time).getTime(), t1 = new Date(s.end_time).getTime();
    tree.push({ ...s, depth,
      leftPct: traceDuration > 0 ? ((t0 - traceStart) / traceDuration) * 100 : 0,
      widthPct: traceDuration > 0 ? ((t1 - t0) / traceDuration) * 100 : 0,
      barColor: serviceColor(s.service_name ?? "", s.status ?? ""),
      durationPct: traceDuration > 0 ? (((s.duration_ms ?? 0) / traceDuration) * 100).toFixed(1) : "—",
    });
    (childrenMap[id] ?? []).map((c) => spanMap[c]).filter(Boolean)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .forEach((c) => dfs(c.span_id, depth + 1));
  };
  spans.filter((s) => !s.parent_span_id || !spanMap[s.parent_span_id])
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .forEach((r) => dfs(r.span_id, 0));
  const svcSet = new Set<string>();
  tree.forEach((s) => s.service_name && svcSet.add(s.service_name));
  return { spanTree: tree, services: Array.from(svcSet), traceDuration };
}

function getTimeLabels(traceDuration: number): string[] {
  return Array.from({ length: 6 }, (_, i) => formatDuration((traceDuration * i) / 5));
}

interface ToolbarProps {
  search: string; setSearch: (v: string) => void;
  activeService: string | null; setActiveService: (v: string | null) => void;
  services: string[]; hasCritical: boolean; hasErrorPath: boolean;
}

function WaterfallToolbar({ search, setSearch, activeService, setActiveService, services, hasCritical, hasErrorPath }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-[var(--glass-border)] border-b px-3 py-2.5">
      <Input placeholder="Search spans..." value={search} onChange={(e) => setSearch(e.target.value)} allowClear size="small" style={{ width: 200 }} />
      <div className="flex flex-wrap gap-1">
        <span onClick={() => setActiveService(null)} className="cursor-pointer rounded-xl border border-[var(--glass-border)] px-2 py-0.5 text-[11px] text-[color:var(--text-secondary)]" style={{ background: activeService === null ? "var(--glass-border)" : "transparent" }}>All</span>
        {services.map((svc) => { const color = serviceColor(svc, ""); const active = activeService === svc; return (
          <span key={svc} onClick={() => setActiveService(active ? null : svc)} className="cursor-pointer rounded-xl px-2 py-0.5 text-[11px]" style={{ background: active ? `${color}22` : "transparent", border: `1px solid ${active ? color : "var(--glass-border)"}`, color: active ? color : "var(--text-secondary)" }}>{svc}</span>
        ); })}
      </div>
      {(hasCritical || hasErrorPath) && (
        <span className="ml-auto flex items-center gap-2.5 text-[11px] text-[color:var(--text-muted)]">
          {hasCritical && <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-3 rounded-sm bg-[#f59e0b]" />Critical path</span>}
          {hasErrorPath && <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-3 rounded-sm bg-[#f04438]" />Error path</span>}
        </span>
      )}
    </div>
  );
}

function WaterfallHeader({ timeLabels }: { timeLabels: string[] }) {
  return (
    <div className="sticky top-0 z-[1] flex border-[var(--glass-border)] border-b-2 bg-[rgba(255,255,255,0.02)]">
      <div className="w-[300px] min-w-[300px] border-[var(--glass-border)] border-r p-3"><span className="pl-2 font-semibold text-[12px] text-[color:var(--text-primary)] uppercase tracking-[0.5px]">Span</span></div>
      <div className="flex w-[60px] min-w-[60px] items-center justify-end border-[var(--glass-border)] border-r p-3"><span className="font-semibold text-[11px] text-[color:var(--text-muted)] uppercase">%</span></div>
      <div className="relative flex-1 p-3">
        <div className="flex h-full items-center justify-between">
          {timeLabels.map((label, i) => <span key={i} className="font-medium text-[11px] text-[color:var(--text-muted)]">{label}</span>)}
        </div>
      </div>
    </div>
  );
}

interface RowProps { span: WaterfallTreeSpan; isSelected: boolean; isCritical: boolean; isError: boolean; onSpanClick?: (s: WaterfallSpan) => void; }

function WaterfallRow({ span, isSelected, isCritical, isError, onSpanClick }: RowProps) {
  const kind = ((span.kind_string || span.span_kind) ?? "").toUpperCase();
  let borderLeft = "none", rowBg = "transparent";
  if (isSelected) { borderLeft = "3px solid var(--literal-hex-5e60ce)"; rowBg = "var(--literal-rgba-94-96-206-0p15)"; }
  else if (isError) { borderLeft = "3px solid #f04438"; rowBg = "rgba(240,68,56,0.06)"; }
  else if (isCritical) { borderLeft = "3px solid #f59e0b"; rowBg = "rgba(245,158,11,0.06)"; }
  const bg = span.barColor.startsWith("#") ? `linear-gradient(90deg, ${span.barColor}, ${span.barColor}dd)` : span.barColor;
  return (
    <div className="flex h-[56px] cursor-pointer border-[var(--glass-border)] border-b transition-[background-color] duration-150 hover:bg-[rgba(255,255,255,0.04)]" style={{ borderLeft, background: rowBg }} onClick={() => onSpanClick?.(span)}>
      <div className="w-[300px] min-w-[300px] border-[var(--glass-border)] border-r">
        <div className="flex flex-col gap-0.5 py-2" style={{ paddingLeft: `${span.depth * 16 + 8}px` }}>
          <div className="flex items-center gap-1">
            {kind && <span className="flex-shrink-0 rounded-[3px] px-1 py-px font-bold text-[9px] leading-[14px] tracking-[0.04em]" style={{ background: `${kindColor(kind)}22`, color: kindColor(kind) }}>{kind.slice(0, 3)}</span>}
            <span className="font-medium text-[11px] text-[color:var(--text-muted)] uppercase tracking-[0.3px]">{span.service_name}</span>
          </div>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap font-normal text-[13px] text-[color:var(--text-primary)]">{span.operation_name}</span>
        </div>
      </div>
      <div className="flex w-[60px] min-w-[60px] items-center justify-end border-[var(--glass-border)] border-r px-2 text-[11px] text-[color:var(--text-muted)] tabular-nums">{span.durationPct}%</div>
      <div className="relative flex-1 py-3">
        <div className="relative h-full">
          <div className="absolute flex h-6 min-w-[3px] animate-[waterfall-bar-enter_0.4s_ease-out_forwards] cursor-pointer items-center justify-start rounded px-1.5 opacity-0 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)] transition-[opacity,transform,box-shadow] duration-200 hover:z-[5] hover:scale-y-[1.15] hover:opacity-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)]" style={{ left: `${span.leftPct}%`, width: `${Math.max(span.widthPct, 0.5)}%`, background: bg }} title={`${span.operation_name} — ${formatDuration(span.duration_ms)}`}>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[10px] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{formatDuration(span.duration_ms)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WaterfallChart({ spans = [], onSpanClick, selectedSpanId, criticalPathSpanIds, errorPathSpanIds }: WaterfallChartProps) {
  const [search, setSearch] = useState("");
  const [activeService, setActiveService] = useState<string | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const { spanTree, services, traceDuration } = useMemo(() => buildSpanTree(spans), [spans]);
  const timeLabels = useMemo(() => getTimeLabels(traceDuration), [traceDuration]);
  const filteredTree = useMemo(() => spanTree.filter((s) => {
    const matchSearch = !search || (s.service_name ?? "").toLowerCase().includes(search.toLowerCase()) || (s.operation_name ?? "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!activeService || s.service_name === activeService);
  }), [spanTree, search, activeService]);
  const virtualizer = useVirtualizer({ count: filteredTree.length, getScrollElement: () => parentRef.current, estimateSize: () => ROW_HEIGHT, overscan: 5 });
  if (!spans || spans.length === 0) return <div className="py-[60px] text-center text-[color:var(--text-muted)] text-sm">No spans available</div>;
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-[var(--glass-bg)]">
      <WaterfallToolbar search={search} setSearch={setSearch} activeService={activeService} setActiveService={setActiveService} services={services} hasCritical={(criticalPathSpanIds?.size ?? 0) > 0} hasErrorPath={(errorPathSpanIds?.size ?? 0) > 0} />
      <WaterfallHeader timeLabels={timeLabels} />
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--scrollbar-thumb-hover)] [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[var(--scrollbar-thumb)] [&::-webkit-scrollbar-track]:bg-[var(--scrollbar-track)] [&::-webkit-scrollbar]:w-2">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
          {virtualizer.getVirtualItems().map((vItem) => {
            const span = filteredTree[vItem.index];
            return (
              <div key={span.span_id} style={{ position: "absolute", top: 0, left: 0, width: "100%", transform: `translateY(${vItem.start}px)` }}>
                <WaterfallRow span={span} isSelected={selectedSpanId === span.span_id} isCritical={criticalPathSpanIds?.has(span.span_id) ?? false} isError={errorPathSpanIds?.has(span.span_id) ?? false} onSpanClick={onSpanClick} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
