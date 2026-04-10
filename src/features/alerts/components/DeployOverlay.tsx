import { GitCommit } from "lucide-react";

interface DeployRef {
  readonly deployId: string;
  readonly service: string;
  readonly deployedAt: string;
}

interface DeployOverlayProps {
  readonly deploys: readonly DeployRef[];
}

export function DeployOverlay({ deploys }: DeployOverlayProps) {
  if (deploys.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
        Deploy correlation
      </div>
      <div className="flex flex-col gap-1">
        {deploys.map((d) => (
          <div
            key={d.deployId}
            className="flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(124,127,242,0.28)] bg-[rgba(124,127,242,0.1)] px-2 py-1 text-[12px] text-[var(--text-primary)]"
          >
            <GitCommit size={12} className="text-[var(--color-primary)]" />
            <span className="font-mono text-[11px]">{d.deployId}</span>
            <span className="text-[var(--text-secondary)]">{d.service}</span>
            <span className="ml-auto text-[var(--text-muted)]">{d.deployedAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
