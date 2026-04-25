import { Input } from "@/components/ui";
import { memo } from "react";

import { serviceColor } from "./waterfallTree";

export interface WaterfallToolbarProps {
  readonly search: string;
  readonly onSearchChange: (v: string) => void;
  readonly activeService: string | null;
  readonly onServiceChange: (v: string | null) => void;
  readonly services: readonly string[];
  readonly hasCritical: boolean;
  readonly hasErrorPath: boolean;
  readonly errorsOnly: boolean;
  readonly onErrorsOnlyChange: (v: boolean) => void;
  readonly hitLabel?: string;
  readonly onJumpPrev?: () => void;
  readonly onJumpNext?: () => void;
}

function WaterfallToolbarComponent(p: WaterfallToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-[var(--glass-border)] border-b px-3 py-2.5">
      <Input
        placeholder="Search spans..."
        value={p.search}
        onChange={(e) => p.onSearchChange(e.target.value)}
        allowClear
        size="small"
        style={{ width: 200 }}
      />
      {p.hitLabel ? <HitNav label={p.hitLabel} onPrev={p.onJumpPrev} onNext={p.onJumpNext} /> : null}
      <label className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
        <input
          type="checkbox"
          checked={p.errorsOnly}
          onChange={(e) => p.onErrorsOnlyChange(e.target.checked)}
        />
        Errors only
      </label>
      <ServicePills services={p.services} active={p.activeService} onChange={p.onServiceChange} />
      {p.hasCritical || p.hasErrorPath ? (
        <PathLegend hasCritical={p.hasCritical} hasErrorPath={p.hasErrorPath} />
      ) : null}
    </div>
  );
}

function HitNav({ label, onPrev, onNext }: { label: string; onPrev?: () => void; onNext?: () => void }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
      <button type="button" onClick={onPrev} className="rounded px-1 hover:bg-[rgba(255,255,255,0.05)]">↑</button>
      <span>{label}</span>
      <button type="button" onClick={onNext} className="rounded px-1 hover:bg-[rgba(255,255,255,0.05)]">↓</button>
    </div>
  );
}

function ServicePills({
  services,
  active,
  onChange,
}: {
  services: readonly string[];
  active: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <span
        onClick={() => onChange(null)}
        className="cursor-pointer rounded-xl border border-[var(--glass-border)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
        style={{ background: active === null ? "var(--glass-border)" : "transparent" }}
      >
        All
      </span>
      {services.map((svc) => {
        const color = serviceColor(svc, "");
        const isActive = active === svc;
        return (
          <span
            key={svc}
            onClick={() => onChange(isActive ? null : svc)}
            className="cursor-pointer rounded-xl px-2 py-0.5 text-[11px]"
            style={{
              background: isActive ? `${color}22` : "transparent",
              border: `1px solid ${isActive ? color : "var(--glass-border)"}`,
              color: isActive ? color : "var(--text-secondary)",
            }}
          >
            {svc}
          </span>
        );
      })}
    </div>
  );
}

function PathLegend({ hasCritical, hasErrorPath }: { hasCritical: boolean; hasErrorPath: boolean }) {
  return (
    <span className="ml-auto flex items-center gap-2.5 text-[11px] text-[var(--text-muted)]">
      {hasCritical ? (
        <span className="flex items-center gap-1">
          <span className="inline-block h-[3px] w-3 rounded-sm bg-[#f59e0b]" />
          Critical path
        </span>
      ) : null}
      {hasErrorPath ? (
        <span className="flex items-center gap-1">
          <span className="inline-block h-[3px] w-3 rounded-sm bg-[#f04438]" />
          Error path
        </span>
      ) : null}
    </span>
  );
}

export const WaterfallToolbar = memo(WaterfallToolbarComponent);
