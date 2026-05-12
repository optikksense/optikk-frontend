import { Check, Copy, Search } from "lucide-react";
import { Fragment, memo, useCallback, useMemo, useState } from "react";

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
    return <div className="tdp-muted">No attributes for this span.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="tdp-attr-search">
        <span className="tdp-search-i">
          <Search size={13} aria-hidden />
        </span>
        <input
          type="text"
          className="tdp-search-input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={`Filter ${allEntries.length} attribute${allEntries.length === 1 ? "" : "s"}…`}
        />
      </div>

      {grouped.length === 0 && <div className="tdp-muted">No attributes match "{filter}".</div>}

      {grouped.map(([prefix, entries]) => (
        <Fragment key={prefix}>
          <div className="tdp-sect-t">{prefix}</div>
          <div className="tdp-attr-list">
            {entries.map((entry) => {
              const rowKey = `${entry.source}-${entry.key}`;
              const justCopied = copiedKey === rowKey;
              const isErr = entry.key.startsWith("error") || entry.key.startsWith("exception");
              return (
                <div key={rowKey} className={`tdp-attr-row ${isErr ? "tdp-attr-row-err" : ""}`}>
                  <span className="tdp-attr-k" title={entry.key}>
                    {entry.key}
                    {entry.source === "resource" && (
                      <span className="tdp-sd-kind" style={{ marginLeft: 6, fontSize: 9 }}>
                        resource
                      </span>
                    )}
                  </span>
                  <span className="tdp-attr-v" title={entry.value}>
                    {entry.value}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {onAddFilter && (
                      <button
                        type="button"
                        className="tdp-iconbtn tdp-attr-copy"
                        onClick={() => onAddFilter(entry.key, entry.value)}
                        title="Filter waterfall by this"
                        aria-label="Add as filter"
                      >
                        <Search size={11} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="tdp-iconbtn tdp-attr-copy"
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
