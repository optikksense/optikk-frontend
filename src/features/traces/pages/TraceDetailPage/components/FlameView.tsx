import { Suspense, lazy, memo } from "react";

import type Flamegraph from "@shared/components/ui/charts/specialized/Flamegraph";

const FlamegraphBody = lazy(() =>
  import("@shared/components/ui/charts/specialized/Flamegraph").then((m) => ({
    default: m.default,
  }))
);

interface Props {
  readonly data: Parameters<typeof Flamegraph>[0]["data"] | null;
  readonly loading: boolean;
  readonly error: boolean;
}

function FlameViewComponent({ data, loading, error }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-[var(--glass-bg)]">
      <Suspense fallback={<Center>Loading flamegraph…</Center>}>
        {data ? (
          <FlamegraphBody data={data} />
        ) : loading ? (
          <Center>Loading flamegraph…</Center>
        ) : error ? (
          <Center error>Failed to load flamegraph</Center>
        ) : (
          <Center>No flamegraph data</Center>
        )}
      </Suspense>
    </div>
  );
}

function Center({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <div
      className={`flex min-h-[400px] flex-1 items-center justify-center text-[12px] ${
        error ? "text-[var(--color-error,#e8494d)]" : "text-[var(--text-muted)]"
      }`}
    >
      {children}
    </div>
  );
}

export const FlameView = memo(FlameViewComponent);
