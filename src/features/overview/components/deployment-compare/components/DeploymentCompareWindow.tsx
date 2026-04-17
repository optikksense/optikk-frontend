import { ArrowUpRight, GitBranch, Radar } from "lucide-react";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Button, Card } from "@shared/components/primitives/ui";

import { formatWindowLabel } from "../utils";

type TimeWindow = DeploymentCompareResponse["before_window"];
type OpenHandler = (target: "logs" | "traces", startMs: number, endMs: number) => void;

interface Props {
  compare: DeploymentCompareResponse;
  onOpen: OpenHandler;
}

function WindowInfo({ compare }: { compare: DeploymentCompareResponse }) {
  const { before_window: before, after_window: after } = compare;
  return (
    <div>
      <div className="flex items-center gap-2">
        <Radar size={16} className="text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">Deployment window</h3>
      </div>
      <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
        {compare.has_baseline && before
          ? `Before: ${formatWindowLabel(before.start_ms, before.end_ms)}`
          : "No prior deployment baseline exists for this release."}
      </p>
      <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
        After: {formatWindowLabel(after.start_ms, after.end_ms)}
      </p>
    </div>
  );
}

function WindowActionGroup({
  label,
  window,
  onOpen,
}: {
  label: "before" | "after";
  window: NonNullable<TimeWindow>;
  onOpen: OpenHandler;
}) {
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        icon={<GitBranch size={14} />}
        onClick={() => onOpen("traces", window.start_ms, window.end_ms)}
      >
        Traces {label}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<ArrowUpRight size={14} />}
        onClick={() => onOpen("logs", window.start_ms, window.end_ms)}
      >
        Logs {label}
      </Button>
    </>
  );
}

function DeploymentCompareWindowComponent({ compare, onOpen }: Props) {
  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <WindowInfo compare={compare} />
        <div className="flex flex-wrap gap-2">
          {compare.before_window ? (
            <WindowActionGroup label="before" window={compare.before_window} onOpen={onOpen} />
          ) : null}
          <WindowActionGroup label="after" window={compare.after_window} onOpen={onOpen} />
        </div>
      </div>
    </Card>
  );
}

export const DeploymentCompareWindow = memo(DeploymentCompareWindowComponent);
