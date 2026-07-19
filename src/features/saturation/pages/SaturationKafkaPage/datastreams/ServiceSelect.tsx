import { Check, ChevronDown, Server } from "lucide-react";
import { useState } from "react";

interface Props {
  readonly options: readonly string[];
  readonly selected: readonly string[];
  readonly onChange: (ids: string[]) => void;
}

/** Client picker. The selection scopes the server query, so it is never empty. */
export function ServiceSelect({ options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const label = selected.length === 1 ? selected[0] : `${selected.length} clients`;

  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
    if (next.length > 0) onChange(next);
  };

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
            {label || "Select a client"}
          </span>
        </span>
        <ChevronDown size={14} className="text-[var(--fg-3)]" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close"
            className="fixed inset-0 z-40 block w-full cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-[38px] left-0 z-41 max-h-[360px] w-[288px] overflow-y-auto rounded-[10px] border border-[var(--line)] bg-[var(--bg-card)] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
            <div className="px-2.5 pt-1.5 pb-1 font-semibold text-[10px] text-[var(--fg-3)] uppercase tracking-[0.06em]">
              Kafka clients · {options.length}
            </div>
            {options.map((id) => {
              const on = selected.includes(id);
              return (
                <button
                  type="button"
                  key={id}
                  onClick={() => toggle(id)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left"
                  style={{ background: on ? "var(--brand-tint)" : "transparent" }}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {on && <Check size={12} style={{ color: "var(--brand)" }} />}
                  </span>
                  <span
                    className="truncate font-mono text-[13px]"
                    style={{
                      color: on ? "var(--brand-deep)" : "var(--fg-1)",
                      fontWeight: on ? 600 : 500,
                    }}
                  >
                    {id}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
