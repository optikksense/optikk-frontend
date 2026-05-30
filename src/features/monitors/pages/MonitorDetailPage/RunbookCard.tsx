import { ExternalLink } from "lucide-react";
import { memo } from "react";

import type { Monitor } from "../../api/monitorsApi";

interface Props {
  readonly monitor: Monitor;
}

function RunbookCard({ monitor }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-sm font-medium text-foreground">Runbook & context</div>
      {monitor.message_body && (
        <div className="mt-2 whitespace-pre-line text-xs leading-6 text-foreground-muted">
          {monitor.message_body}
        </div>
      )}
      <div className="mt-3 flex flex-col gap-1.5">
        {monitor.runbook_url && (
          <a
            href={monitor.runbook_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded bg-secondary px-3 py-2 text-xs text-primary hover:underline"
          >
            <ExternalLink size={12} />
            Open runbook
          </a>
        )}
      </div>
    </div>
  );
}

export default memo(RunbookCard);
