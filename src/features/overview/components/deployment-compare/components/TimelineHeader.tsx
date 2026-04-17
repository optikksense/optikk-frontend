import { memo } from "react";

import { Badge } from "@shared/components/primitives/ui";

function TimelineHeaderComponent({ version }: { version: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-[var(--text-primary)]">Version traffic</h3>
        <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
          Release-centered traffic view across the baseline and post-deploy windows.
        </p>
      </div>
      <Badge variant="info">Release {version}</Badge>
    </div>
  );
}

export const TimelineHeader = memo(TimelineHeaderComponent);
