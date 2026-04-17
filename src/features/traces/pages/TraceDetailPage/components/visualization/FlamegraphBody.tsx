import { memo } from "react";

import Flamegraph from "@shared/components/ui/charts/specialized/Flamegraph";

interface Props {
  data: Parameters<typeof Flamegraph>[0]["data"] | null;
  loading: boolean;
  error: boolean;
}

function FlamegraphBodyComponent({ data, loading, error }: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="ok-spinner" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-8 text-center text-[var(--text-muted)] text-sm">
        Could not load flamegraph data for this trace.
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-8 text-center text-[var(--text-muted)] text-sm">
        No flamegraph data available for this trace.
      </div>
    );
  }
  return <Flamegraph data={data} />;
}

export const FlamegraphBody = memo(FlamegraphBodyComponent);
