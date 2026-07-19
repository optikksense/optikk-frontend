import type { FleetPod } from "../../../types";

export type ProcessedFleetPod = FleetPod & {
  status: "running" | "pending" | "terminating" | "crashloop" | "oomkilled";
  ns: string;
  img: string;
  age: string;
  restarts: number;
  cpu: number;
  mem: number;
};

const STATUS_COLOR: Record<string, string> = {
  running: "var(--ok)",
  pending: "var(--warn)",
  terminating: "var(--fg-mute)",
  crashloop: "var(--err)",
  oomkilled: "var(--err)",
};

interface Props {
  title: string;
  metricType: "cpu" | "mem";
  containers: ProcessedFleetPod[];
  onOpenContainer: (container: string) => void;
}

export function TopContainersList({ title, metricType, containers, onOpenContainer }: Props) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="font-bold text-[13px] text-foreground leading-tight">{title}</div>
      <div className="mt-0.5 text-[11.5px] text-foreground-muted">last 1 hour</div>
      <div className="mt-3 flex flex-col gap-1.5">
        {containers.map((c) => {
          const val = metricType === "cpu" ? c.cpu : c.mem;
          const isHigh = val >= 90;

          return (
            <button
              key={c.podName}
              type="button"
              onClick={() => onOpenContainer(c.podName)}
              className="flex items-center justify-between rounded-md p-1.5 text-left transition-colors hover:bg-muted"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: STATUS_COLOR[c.status] || "var(--fg-mute)",
                    flexShrink: 0,
                  }}
                />
                <span className="truncate font-medium font-mono text-[12.5px] text-foreground">
                  {c.podName}
                </span>
              </div>
              <span
                className="font-mono font-semibold text-[12.5px]"
                style={{ color: isHigh ? "var(--err)" : "var(--warn-fg)" }}
              >
                {val}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
