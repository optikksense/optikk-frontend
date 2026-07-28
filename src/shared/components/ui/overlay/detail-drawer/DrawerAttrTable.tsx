import { Check, Copy, Search, X } from "lucide-react";
import { type ReactNode, useState } from "react";

/** [key, value, optionalValueColorToken] */
type DrawerAttrRow = readonly [string, string, string?];

export interface DrawerAttrGroup {
  readonly label: string;
  readonly icon?: ReactNode;
  readonly rows: readonly DrawerAttrRow[];
}

interface DrawerKVProps {
  readonly name: string;
  readonly value: string;
  readonly valueColor?: string;
  readonly last: boolean;
}

function DrawerKV({ name, value, valueColor, last }: DrawerKVProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1100);
    });
  };
  return (
    <div
      className="group grid grid-cols-[168px_1fr_auto] items-center gap-2.5 px-2.5 py-[7px] font-mono text-[12.5px]"
      style={{ borderBottom: last ? undefined : "1px solid var(--line-2)" }}
    >
      <span
        className="overflow-hidden text-ellipsis whitespace-nowrap text-[var(--fg-3)]"
        title={name}
      >
        {name}
      </span>
      <span
        className="overflow-hidden text-ellipsis whitespace-nowrap"
        title={value}
        style={{ color: valueColor ?? "var(--fg-0)" }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        title="Copy value"
        aria-label="Copy value"
        className="inline-flex cursor-pointer items-center border-0 bg-transparent opacity-0 group-hover:opacity-100"
        style={{ color: copied ? "var(--ok)" : "var(--fg-3)", opacity: copied ? 1 : undefined }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
}

interface DrawerAttrTableProps {
  readonly groups: readonly DrawerAttrGroup[];
  readonly searchable?: boolean;
}

export function DrawerAttrTable({ groups, searchable = true }: DrawerAttrTableProps) {
  const [q, setQ] = useState("");
  const norm = q.trim().toLowerCase();
  const visible = groups
    .map((g) => ({
      ...g,
      rows: g.rows.filter(
        ([k, v]) =>
          !norm || k.toLowerCase().includes(norm) || String(v).toLowerCase().includes(norm)
      ),
    }))
    .filter((g) => g.rows.length > 0);

  return (
    <div>
      {searchable && (
        <div className="mb-2.5 flex h-[30px] items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--bg-card)] px-2.5">
          <Search size={13} className="text-[var(--fg-3)]" aria-hidden />
          <input
            placeholder="Filter attributes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear filter"
              className="inline-flex cursor-pointer items-center border-0 bg-transparent text-[var(--fg-3)]"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}
      {visible.length === 0 && (
        <div className="px-0.5 py-3 text-[13px] text-[var(--fg-3)]">No attributes match “{q}”.</div>
      )}
      {visible.map((g) => (
        <div
          key={g.label}
          className="mb-3 overflow-hidden rounded-lg border border-[var(--line-2)] bg-[var(--bg-card)]"
        >
          <div className="flex items-center gap-2 border-[var(--line-2)] border-b bg-[var(--bg-inset)] px-2.5 py-[7px]">
            {g.icon ? <span className="text-[var(--fg-3)]">{g.icon}</span> : null}
            <span className="font-semibold text-[11px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
              {g.label}
            </span>
            <span className="flex-1" />
            <span className="font-mono text-[11.5px] text-[var(--fg-3)]">{g.rows.length}</span>
          </div>
          {g.rows.map(([k, v, c], i) => (
            <DrawerKV key={k} name={k} value={v} valueColor={c} last={i === g.rows.length - 1} />
          ))}
        </div>
      ))}
    </div>
  );
}
