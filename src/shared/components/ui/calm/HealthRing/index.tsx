import { cn } from "@/lib/utils";

/**
 *
 */
export type HealthStatus = "healthy" | "degraded" | "critical" | "unknown";

interface HealthRingProps {
  serviceName: string;
  status: HealthStatus;
  rps?: number;
  errorPct?: number;
  p95Ms?: number;
  size?: number;
  onClick?: (serviceName: string) => void;
}

const STATUS_COLORS: Record<HealthStatus, string> = {
  healthy: "var(--color-healthy, #52876B)",
  degraded: "var(--color-degraded, #D97706)",
  critical: "var(--color-critical, #DC2626)",
  unknown: "var(--color-unknown, #6B7280)",
};

const STATUS_GLOW: Record<HealthStatus, string> = {
  healthy: "var(--color-healthy-glow, rgba(82, 135, 107, 0.25))",
  degraded: "var(--color-degraded-glow, rgba(217, 119, 6, 0.20))",
  critical: "var(--color-critical-glow, rgba(220, 38, 38, 0.20))",
  unknown: "transparent",
};

export default function HealthRing({
  serviceName,
  status,
  rps,
  errorPct,
  p95Ms,
  size = 52,
  onClick,
}: HealthRingProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;
  const color = STATUS_COLORS[status];
  const glow = STATUS_GLOW[status];

  const initial = serviceName.charAt(0).toUpperCase();

  const tooltipParts: string[] = [];
  if (rps !== undefined) tooltipParts.push(`${rps.toFixed(1)} rps`);
  if (errorPct !== undefined) tooltipParts.push(`${errorPct.toFixed(1)}% errors`);
  if (p95Ms !== undefined) tooltipParts.push(`p95 ${p95Ms.toFixed(0)}ms`);
  const tooltip = tooltipParts.join(" · ");

  return (
    <button
      type="button"
      className={cn(
        "inline-flex flex-shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-lg border-0 bg-transparent transition-[background] duration-150 ease-out hover:bg-[var(--bg-hover)]"
      )}
      title={tooltip ? `${serviceName}: ${tooltip}` : serviceName}
      onClick={() => onClick?.(serviceName)}
      style={{ width: size + 16, padding: "8px 0" }}
    >
      <svg aria-hidden="true">
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={3}
        />
        {/* Ring fill */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-[stroke-dashoffset] duration-350 ease-out"
        />
        {/* Center initial */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.28}
          fontWeight={600}
          fill={color}
          fontFamily="Inter, sans-serif"
        >
          {initial}
        </text>
      </svg>
      <span
        className={cn(
          "max-w-[64px] overflow-hidden text-ellipsis whitespace-nowrap text-center font-medium text-[10px] text-[color:var(--text-secondary)]",
          status === "critical" && "text-[color:var(--color-critical)]"
        )}
      >
        {serviceName}
      </span>
    </button>
  );
}
