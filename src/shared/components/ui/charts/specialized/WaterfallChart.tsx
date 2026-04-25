import { useRef } from "react";

import { WaterfallList } from "./WaterfallList";
import { WaterfallRuler } from "./WaterfallRuler";
import { WaterfallToolbar, type WaterfallToolbarProps } from "./WaterfallToolbar";
import { useWaterfallState } from "./useWaterfallState";
import type { WaterfallSpan } from "./waterfallTypes";

export type { WaterfallSpan } from "./waterfallTypes";

interface Props {
  readonly spans?: readonly WaterfallSpan[];
  readonly onSpanClick?: (span: WaterfallSpan) => void;
  readonly selectedSpanId?: string | null;
  readonly criticalPathSpanIds?: Set<string>;
  readonly errorPathSpanIds?: Set<string>;
  /** Controlled state (driven by tracesStore so keyboard shortcuts share it). */
  readonly search?: string;
  readonly onSearchChange?: (s: string) => void;
  readonly errorsOnly?: boolean;
  readonly onErrorsOnlyChange?: (v: boolean) => void;
  readonly collapsedSpanIds?: ReadonlySet<string>;
  readonly onToggleCollapse?: (spanId: string) => void;
}

export default function WaterfallChart(props: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const s = useWaterfallState({
    spans: props.spans ?? [],
    parentRef,
    searchProp: props.search,
    errorsOnlyProp: props.errorsOnly,
    collapsedSpanIds: props.collapsedSpanIds,
  });
  if (!props.spans || props.spans.length === 0) {
    return <div className="py-[60px] text-center text-sm text-[var(--text-muted)]">No spans available</div>;
  }
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-[var(--glass-bg)]">
      <WaterfallToolbar {...toolbarProps(props, s)} />
      <WaterfallRuler traceDuration={s.tree.traceDuration} />
      <WaterfallList
        parentRef={parentRef}
        virtualizer={s.virtualizer}
        visibleTree={s.visibleTree}
        selectedSpanId={props.selectedSpanId}
        criticalPathSpanIds={props.criticalPathSpanIds}
        errorPathSpanIds={props.errorPathSpanIds}
        hitSpanId={s.hitSpanId}
        collapsed={s.collapsed}
        onSpanClick={props.onSpanClick}
        onToggleCollapse={props.onToggleCollapse}
      />
    </div>
  );
}

function toolbarProps(props: Props, s: ReturnType<typeof useWaterfallState>): WaterfallToolbarProps {
  const setSearch = props.onSearchChange ?? s.setLocalSearch;
  const setErrorsOnly = props.onErrorsOnlyChange ?? s.setLocalErrorsOnly;
  return {
    search: s.search,
    onSearchChange: setSearch,
    activeService: s.activeService,
    onServiceChange: s.setActiveService,
    services: s.tree.services,
    hasCritical: (props.criticalPathSpanIds?.size ?? 0) > 0,
    hasErrorPath: (props.errorPathSpanIds?.size ?? 0) > 0,
    errorsOnly: s.errorsOnly,
    onErrorsOnlyChange: setErrorsOnly,
    hitLabel: hitCountLabel(s.search, s.hitIndex, s.hits.length),
    onJumpPrev: () => s.setHitIndex((i) => (s.hits.length === 0 ? 0 : (i - 1 + s.hits.length) % s.hits.length)),
    onJumpNext: () => s.setHitIndex((i) => (s.hits.length === 0 ? 0 : (i + 1) % s.hits.length)),
  };
}

function hitCountLabel(search: string, hitIndex: number, hitsLen: number): string | undefined {
  if (!search || hitsLen === 0) return undefined;
  return `${Math.min(hitIndex + 1, hitsLen)}/${hitsLen}`;
}
