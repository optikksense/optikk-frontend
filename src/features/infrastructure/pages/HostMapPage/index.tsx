import { useNavigate } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { useState } from "react";

import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { getNodes, getNodesSummary } from "../../api/hostsApi";
import { HostHexGrid } from "./HostHexGrid";

type ColorKey = "cpu" | "errors" | "latency";

function ColorPicker({
  value,
  onChange,
}: {
  value: ColorKey;
  onChange: (v: ColorKey) => void;
}) {
  const opts: ColorKey[] = ["cpu", "errors", "latency"];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        Color by
      </span>
      <div className="flex gap-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] p-0.5">
        {opts.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`rounded px-2 py-0.5 text-[11px] capitalize ${
              value === o
                ? "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryStrip({
  healthy,
  degraded,
  unhealthy,
  totalPods,
}: {
  healthy: number;
  degraded: number;
  unhealthy: number;
  totalPods: number;
}) {
  return (
    <PageSurface elevation={1} padding="md">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <div className="text-[11px] text-emerald-400 uppercase tracking-[0.08em]">Healthy</div>
          <div className="mt-1 font-semibold text-[20px] text-[var(--text-primary)]">
            {formatNumber(healthy)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-amber-400 uppercase tracking-[0.08em]">Degraded</div>
          <div className="mt-1 font-semibold text-[20px] text-[var(--text-primary)]">
            {formatNumber(degraded)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-red-400 uppercase tracking-[0.08em]">Unhealthy</div>
          <div className="mt-1 font-semibold text-[20px] text-[var(--text-primary)]">
            {formatNumber(unhealthy)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Pods
          </div>
          <div className="mt-1 font-semibold text-[20px] text-[var(--text-primary)]">
            {formatNumber(totalPods)}
          </div>
        </div>
      </div>
    </PageSurface>
  );
}

export default function HostMapPage(): JSX.Element {
  const navigate = useNavigate();
  const [colorBy, setColorBy] = useState<ColorKey>("errors");

  const summaryQ = useTimeRangeQuery("hosts-summary", (_t, s, e) =>
    getNodesSummary(Number(s), Number(e))
  );
  const nodesQ = useTimeRangeQuery("hosts-list", (_t, s, e) => getNodes(Number(s), Number(e)));

  const summary = summaryQ.data;

  return (
    <PageShell>
      <PageHeader
        title="Host map"
        subtitle="Every host emitting telemetry. Color by health signal; click a host to drill in."
        icon={<Server size={24} />}
        actions={<ColorPicker value={colorBy} onChange={setColorBy} />}
      />

      <SummaryStrip
        healthy={summary?.healthy_nodes ?? 0}
        degraded={summary?.degraded_nodes ?? 0}
        unhealthy={summary?.unhealthy_nodes ?? 0}
        totalPods={summary?.total_pods ?? 0}
      />

      <PageSurface padding="lg">
        <HostHexGrid
          nodes={nodesQ.data ?? []}
          colorBy={colorBy}
          onSelect={(host) =>
            navigate({ to: `/infrastructure/hosts/${encodeURIComponent(host)}` })
          }
        />
      </PageSurface>
    </PageShell>
  );
}
