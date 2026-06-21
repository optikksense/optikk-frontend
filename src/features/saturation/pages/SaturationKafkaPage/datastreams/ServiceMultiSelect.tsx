import { Check, ChevronDown, Server } from "lucide-react";
import { useState } from "react";

import type { KafkaService, Level } from "./model";

const DOT: Record<Level, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  err: "var(--err)",
};

interface Props {
  readonly options: readonly KafkaService[];
  readonly selected: readonly string[];
  readonly onToggle: (id: string) => void;
}

/** Multi-select client dropdown (design `ServiceMultiSelect`). */
export function ServiceMultiSelect({ options, selected, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const sorted = options.slice().sort((a, b) => a.id.localeCompare(b.id));
  const label = selected.length === 1 ? selected[0] : `${selected.length} clients selected`;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 min-w-[248px] items-center justify-between gap-2 rounded-md border bg-[var(--bg-card)] px-2.5"
        style={{ borderColor: open ? "var(--brand)" : "var(--line)" }}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <Server size={13} style={{ color: "var(--brand)" }} />
          <span className="truncate font-mono font-semibold text-[13px] text-[var(--fg-0)]">
            {label}
          </span>
        </span>
        <ChevronDown size={14} className="text-[var(--fg-3)]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[38px] left-0 z-41 max-h-[360px] w-[288px] overflow-y-auto rounded-[10px] border border-[var(--line)] bg-[var(--bg-card)] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
            <div className="px-2.5 pt-1.5 pb-1 font-semibold text-[10px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
              Select clients · {selected.length} active
            </div>
            {sorted.map((s) => {
              const on = selected.includes(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => onToggle(s.id)}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 py-2"
                  style={{ background: on ? "var(--brand-tint)" : "transparent" }}
                >
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded border-[1.5px]"
                    style={{
                      borderColor: on ? "var(--brand)" : "var(--line-2)",
                      background: on ? "var(--brand)" : "transparent",
                    }}
                  >
                    {on && <Check size={11} className="text-white" />}
                  </span>
                  <span
                    className="h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: DOT[s.status] }}
                  />
                  <span
                    className="truncate font-mono text-[13px]"
                    style={{
                      color: on ? "var(--brand-deep)" : "var(--fg-1)",
                      fontWeight: on ? 600 : 500,
                    }}
                  >
                    {s.id}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
