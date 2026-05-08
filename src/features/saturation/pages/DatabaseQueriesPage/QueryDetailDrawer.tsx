import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Surface } from "@/components/ui";

import type { SlowQueryPatternRow } from "../../api/databaseSlowQueriesApi";

interface Props {
  readonly query: SlowQueryPatternRow | null;
  readonly onClose: () => void;
}

function fmtMs(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function fmtCount(v: number | null | undefined): string {
  if (v == null) return "0";
  return v.toLocaleString();
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
      <div className="mt-1 font-semibold text-[18px] tabular-nums text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

function DrawerBody({ query }: { query: SlowQueryPatternRow }) {
  const errorRate =
    query.call_count > 0
      ? `${((query.error_count / query.call_count) * 100).toFixed(2)}%`
      : "—";
  return (
    <div className="flex flex-col gap-4 p-4">
      <Surface elevation={1} padding="sm">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          Query text
        </div>
        <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[12px] text-[var(--text-primary)]">
          {query.query_text}
        </pre>
      </Surface>
      <Surface elevation={1} padding="sm">
        <div className="grid grid-cols-3 gap-4">
          <StatTile label="Calls" value={fmtCount(query.call_count)} />
          <StatTile label="Errors" value={fmtCount(query.error_count)} />
          <StatTile label="Error rate" value={errorRate} />
          <StatTile label="p50" value={fmtMs(query.p50_ms)} />
          <StatTile label="p95" value={fmtMs(query.p95_ms)} />
          <StatTile label="p99" value={fmtMs(query.p99_ms)} />
        </div>
      </Surface>
      <Surface elevation={1} padding="sm">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          Collection
        </div>
        <div className="mt-1 font-mono text-[13px] text-[var(--text-primary)]">
          {query.collection_name || "—"}
        </div>
      </Surface>
    </div>
  );
}

export function QueryDetailDrawer({ query, onClose }: Props) {
  return (
    <Drawer
      open={!!query}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
      direction="right"
    >
      <DrawerContent className="top-0 right-0 left-auto overflow-auto" style={{ width: 560 }}>
        <DrawerHeader>
          <DrawerTitle>Query detail</DrawerTitle>
          <DrawerClose
            aria-label="Close"
            className="cursor-pointer border-none bg-transparent text-lg leading-none"
          >
            &times;
          </DrawerClose>
        </DrawerHeader>
        {query ? <DrawerBody query={query} /> : null}
      </DrawerContent>
    </Drawer>
  );
}
