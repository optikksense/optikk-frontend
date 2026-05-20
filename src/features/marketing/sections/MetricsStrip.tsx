import { Counter } from "../motion/Counter";
import { Reveal } from "../motion/Reveal";

interface MetricItem {
  readonly value: number;
  readonly decimals?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly label: string;
  readonly grad?: boolean;
}

interface MetricsStripProps {
  readonly metrics: readonly MetricItem[];
}

export function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
    <Reveal>
      <div className="m-metrics">
        {metrics.map((m) => (
          <div key={m.label} className="m-metric">
            <Counter
              to={m.value}
              decimals={m.decimals ?? 0}
              prefix={m.prefix}
              suffix={m.suffix}
              className={`m-metric-value m-counter${m.grad ? " is-grad" : ""}`}
            />
            <div className="m-metric-label">{m.label}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
