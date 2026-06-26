import { SparklineCell } from "@shared/components/ui/charts/micro/SparklineCell";

type SparkTone = "info" | "warn" | "err";

interface DrawerMiniSignalProps {
  readonly label: string;
  readonly legend?: string;
  readonly values: number[];
  readonly tone?: SparkTone;
  /** [topTick, bottomTick] labels for the y-axis. */
  readonly yTicks?: readonly [string, string];
}

export function DrawerMiniSignal({ label, legend, values, tone, yTicks }: DrawerMiniSignalProps) {
  const hasData = values.length > 1;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[12.5px] text-[var(--fg-3)]">{label}</span>
        {legend ? (
          <span className="font-mono text-[11.5px] text-[var(--fg-3)]">{legend}</span>
        ) : null}
      </div>
      <div className="grid grid-cols-[26px_1fr]">
        <div className="flex h-16 flex-col justify-between pr-1.5 text-right">
          {(yTicks ?? ["", ""]).map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="font-mono text-[10.5px] text-[var(--fg-3)] leading-none"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="relative h-16 border-[var(--line)] border-b border-l">
          <div className="absolute top-1/2 right-0 left-0 border-[var(--line-2)] border-t border-dashed" />
          {hasData ? (
            <div className="absolute inset-0">
              <SparklineCell
                values={values}
                tone={tone ?? "info"}
                width={240}
                height={64}
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-[var(--fg-3)]">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
