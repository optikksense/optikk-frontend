import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Card } from "@shared/components/primitives/ui";
import { formatNumber } from "@shared/utils/formatters";

import { type WindowVolume, useLogVolumeDiff } from "../hooks/useLogVolumeDiff";
import { DeltaPill } from "./DeltaPill";

interface Props {
  readonly compare: DeploymentCompareResponse;
}

function delta(before: WindowVolume | null, key: keyof WindowVolume, after: WindowVolume): number {
  if (!before) return 0;
  return after[key] - before[key];
}

function Row({
  label,
  before,
  after,
  diff,
}: {
  label: string;
  before: WindowVolume | null;
  after: WindowVolume;
  diff: number;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 py-1">
      <span className="text-[12px] text-[var(--text-secondary)]">{label}</span>
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {before ? formatNumber(before.total) : "—"}
      </span>
      <span className="font-mono text-[11px] text-[var(--text-primary)]">
        {formatNumber(after.total)}
      </span>
      <DeltaPill delta={diff} formatter={(value) => formatNumber(value)} invert />
    </div>
  );
}

function DeploymentCompareLogVolumeDiffComponent({ compare }: Props) {
  const serviceName = compare.deployment.service_name;
  const { before, after, loading } = useLogVolumeDiff(
    serviceName,
    compare.before_window?.start_ms,
    compare.before_window?.end_ms,
    compare.after_window.start_ms,
    compare.after_window.end_ms
  );

  if (loading && after.total === 0) return null;
  if (after.total === 0 && (!before || before.total === 0)) return null;

  const totalBefore: WindowVolume = before ?? { total: 0, errors: 0, fatals: 0, warnings: 0 };
  const errorAfter: WindowVolume = { ...after, total: after.errors };
  const errorBefore: WindowVolume = { ...totalBefore, total: totalBefore.errors };
  const warnAfter: WindowVolume = { ...after, total: after.warnings };
  const warnBefore: WindowVolume = { ...totalBefore, total: totalBefore.warnings };

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-3">
        <h3 className="m-0 font-semibold text-[var(--text-primary)]">Log volume diff</h3>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Total and ERROR/WARN counts before vs after deploy ({serviceName}).
        </p>
      </div>
      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-3 text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        <span>Severity</span>
        <span className="text-right">Before</span>
        <span className="text-right">After</span>
        <span className="text-right">Δ</span>
      </div>
      <div className="flex flex-col divide-y divide-[var(--border-color)]">
        <Row label="Total" before={before} after={after} diff={delta(before, "total", after)} />
        <Row
          label="Errors"
          before={before ? errorBefore : null}
          after={errorAfter}
          diff={delta(before, "errors", after)}
        />
        <Row
          label="Warnings"
          before={before ? warnBefore : null}
          after={warnAfter}
          diff={delta(before, "warnings", after)}
        />
      </div>
    </Card>
  );
}

export const DeploymentCompareLogVolumeDiff = memo(DeploymentCompareLogVolumeDiffComponent);
