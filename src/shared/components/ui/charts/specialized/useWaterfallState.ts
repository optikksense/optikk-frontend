import { useEffect, useMemo, useState, type RefObject } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { applyCollapse, buildSpanTree } from "./waterfallTree";
import type { WaterfallSpan, WaterfallTreeSpan } from "./waterfallTypes";

const ROW_HEIGHT = 56;
const EMPTY_SET: ReadonlySet<string> = new Set();

export interface WaterfallStateInput {
  readonly spans: readonly WaterfallSpan[];
  readonly parentRef: RefObject<HTMLDivElement | null>;
  readonly searchProp?: string;
  readonly errorsOnlyProp?: boolean;
  readonly collapsedSpanIds?: ReadonlySet<string>;
}

export function useWaterfallState(input: WaterfallStateInput) {
  const { spans, parentRef, searchProp, errorsOnlyProp, collapsedSpanIds } = input;
  const [localSearch, setLocalSearch] = useState("");
  const [localErrorsOnly, setLocalErrorsOnly] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [hitIndex, setHitIndex] = useState(0);

  const search = searchProp ?? localSearch;
  const errorsOnly = errorsOnlyProp ?? localErrorsOnly;
  const collapsed = collapsedSpanIds ?? EMPTY_SET;

  const tree = useMemo(() => buildSpanTree(spans), [spans]);
  const visibleTree = useMemo(
    () => filterTree(applyCollapse(tree.spanTree, collapsed), search, activeService, errorsOnly),
    [tree.spanTree, collapsed, search, activeService, errorsOnly],
  );
  const hits = useMemo(() => searchHits(visibleTree, search), [visibleTree, search]);

  const virtualizer = useVirtualizer({
    count: visibleTree.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  useEffect(() => {
    if (hits.length === 0) return;
    const idx = hits[Math.min(hitIndex, hits.length - 1)];
    if (idx >= 0) virtualizer.scrollToIndex(idx, { align: "center" });
  }, [hits, hitIndex, virtualizer]);

  const hitSpanId = hits.length > 0 ? visibleTree[hits[Math.min(hitIndex, hits.length - 1)]]?.span_id ?? null : null;

  return {
    tree, visibleTree, hits, hitIndex, setHitIndex, hitSpanId,
    search, setLocalSearch, errorsOnly, setLocalErrorsOnly,
    activeService, setActiveService, virtualizer, collapsed,
  };
}

function filterTree(
  tree: readonly WaterfallTreeSpan[],
  search: string,
  activeService: string | null,
  errorsOnly: boolean,
): readonly WaterfallTreeSpan[] {
  const q = search.toLowerCase();
  return tree.filter((s) => {
    if (errorsOnly && !(s.has_error ?? s.status === "ERROR")) return false;
    if (activeService && s.service_name !== activeService) return false;
    if (!q) return true;
    return (s.service_name ?? "").toLowerCase().includes(q) || (s.operation_name ?? "").toLowerCase().includes(q);
  });
}

function searchHits(tree: readonly WaterfallTreeSpan[], search: string): readonly number[] {
  if (!search) return [];
  const q = search.toLowerCase();
  const out: number[] = [];
  tree.forEach((s, i) => {
    if ((s.service_name ?? "").toLowerCase().includes(q) || (s.operation_name ?? "").toLowerCase().includes(q)) out.push(i);
  });
  return out;
}
