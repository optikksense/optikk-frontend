import { Check, Copy, Search } from "lucide-react";
import { Fragment, memo, useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface Props {
  readonly spanAttributes: Record<string, string>;
  readonly resourceAttributes: Record<string, string>;
  /** Adds `key:value` token to the trace-level filter (waterfall search). */
  readonly onAddFilter?: (key: string, value: string) => void;
}

interface Entry {
  readonly key: string;
  readonly value: string;
  readonly source: "span" | "resource";
}

function prefixOf(key: string): string {
  const dot = key.indexOf(".");
  if (dot <= 0) return "other";
  return key.slice(0, dot);
}

const sectTitle =
  "text-[10.5px] tracking-[0.06em] uppercase text-foreground-caption";
const muted = "text-foreground-caption text-[12px] py-2";
const iconBtn =
  "inline-grid place-items-center w-6 h-6 rounded-md text-foreground-muted bg-transparent border-0 cursor-pointer opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground";

function AttributesTableComponent({ spanAttributes, resourceAttributes, onAddFilter }: Props) {
  const [filter, setFilter] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const allEntries = useMemo<Entry[]>(() => {
    const entries: Entry[] = [];
    for (const [k, v] of Object.entries(spanAttributes))
      entries.push({ key: k, value: v, source: "span" });
    for (const [k, v] of Object.entries(resourceAttributes))
      entries.push({ key: k, value: v, source: "resource" });
    entries.sort((a, b) => a.key.localeCompare(b.key));
    return entries;
  }, [spanAttributes, resourceAttributes]);

  const grouped = useMemo<readonly [string, readonly Entry[]][]>(() => {
    const filteredEntries = filter
      ? allEntries.filter(
          (e) =>
            e.key.toLowerCase().includes(filter.toLowerCase()) ||
            e.value.toLowerCase().includes(filter.toLowerCase())
        )
      : allEntries;
    const map = new Map<string, Entry[]>();
    for (const e of filteredEntries) {
      const p = prefixOf(e.key);
      if (!map.has(p)) map.set(p, []);
      map.get(p)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allEntries, filter]);

  const handleCopy = useCallback((entry: Entry) => {
    void navigator.clipboard?.writeText(`${entry.key}=${entry.value}`).then(() => {
      setCopiedKey(`${entry.source}-${entry.key}`);
      setTimeout(() => setCopiedKey(null), 1100);
    });
  }, []);

  if (allEntries.length === 0) {
    return <div className={muted}>No attributes for this span.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 px-[9px] py-1.5 bg-background border border-border rounded-md">
        <span className="text-foreground-caption inline-flex items-center">
          <Search size={13} aria-hidden />
        </span>
        <input
          type="text"
          className="flex-1 bg-transparent border-0 outline-none text-foreground font-inherit text-[12px] min-w-0 placeholder:text-foreground-caption"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${allEntries.length} attribute${allEntries.length === 1 ? "" : "s"}…`}
        />
      </div>

      {grouped.length === 0 && <div className={muted}>No attributes match "{filter}".</div>}

      {grouped.map(([prefix, entries]) => (
        <Fragment key={prefix}>
          <div className={sectTitle}>{prefix}</div>
          <div className="flex flex-col gap-px bg-border rounded-md overflow-hidden">
            {entries.map((entry) => {
              const rowKey = `${entry.source}-${entry.key}`;
              const justCopied = copiedKey === rowKey;
              const isErr = entry.key.startsWith("error") || entry.key.startsWith("exception");
              return (
                <div
                  key={rowKey}
                  className={cn(
                    "group grid grid-cols-[180px_1fr_auto] gap-2.5 items-center px-2.5 py-1.5 bg-background text-[12px] hover:bg-secondary",
                    isErr && "!bg-error-subtle"
                  )}
                >
                  <span
                    className="text-foreground-muted font-mono text-[11.5px] break-all"
                    title={entry.key}
                  >
                    {entry.key}
                    {entry.source === "resource" && (
                      <span className="font-mono text-[9px] text-foreground-caption px-1.5 py-px bg-muted rounded-[4px] ml-1.5">
                        resource
                      </span>
                    )}
                  </span>
                  <span
                    className="text-foreground font-mono text-[11.5px] overflow-hidden text-ellipsis whitespace-nowrap"
                    title={entry.value}
                  >
                    {entry.value}
                  </span>
                  <div className="flex gap-1">
                    {onAddFilter && (
                      <button
                        type="button"
                        className={iconBtn}
                        onClick={() => onAddFilter(entry.key, entry.value)}
                        title="Filter waterfall by this"
                        aria-label="Add as filter"
                      >
                        <Search size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      className={iconBtn}
                      onClick={() => handleCopy(entry)}
                      title="Copy key=value"
                      aria-label="Copy"
                    >
                      {justCopied ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export const AttributesTable = memo(AttributesTableComponent);
