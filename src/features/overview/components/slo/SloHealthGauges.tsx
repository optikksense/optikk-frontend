import { Badge, Skeleton, Surface } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

import { APP_COLORS } from "@config/colorLiterals";

interface SloHealthGaugesProps {
  isLoading: boolean;
  availabilityPct: number;
  p95Ms: number;
  errorBudget: number;
  isCompliant: boolean;
  compliancePct: string;
  timeseriesLength: number;
  breachedCount: number;
  totalRequests: number;
  averageLatencyMs: number;
  availabilityTarget: number;
  p95TargetMs: number;
}

/**
 *
 * @param value
 */
const n = (value: any) => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

interface SloGaugeProps {
  title: string;
  value: number;
  target: number;
  unit?: "%" | "ms";
  description?: string;
}

/**
 *
 * @param root0
 * @param root0.title
 * @param root0.value
 * @param root0.target
 * @param root0.unit
 * @param root0.description
 */
function SloGauge({ title, value, target, unit = "%", description }: SloGaugeProps) {
  const percent =
    unit === "ms" ? Math.min(100, (target / Math.max(value, 0.001)) * 100) : Math.min(100, value);
  const good = unit === "ms" ? value <= target : value >= target;
  const strokeColor = good
    ? APP_COLORS.hex_12b76a
    : percent >= 80
      ? APP_COLORS.hex_f79009
      : APP_COLORS.hex_f04438;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        padding: "20px 24px",
        background: `var(--bg-tertiary, ${APP_COLORS.hex_1a1a1a_2})`,
        borderRadius: 8,
        border: `1px solid var(--border-color, ${APP_COLORS.hex_2d2d2d})`,
        minWidth: 160,
        flex: 1,
      }}
    >
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <svg aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={APP_COLORS.hex_2d2d2d}
            strokeWidth="8"
            strokeDasharray="198"
            strokeDashoffset="49.5"
            strokeLinecap="round"
            transform="rotate(135 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray="198"
            strokeDashoffset={198 - (Number(percent.toFixed(1)) / 100) * 148.5}
            strokeLinecap="round"
            transform="rotate(135 50 50)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: strokeColor }}>
            {unit === "ms" ? `${n(value).toFixed(0)}ms` : `${n(value).toFixed(2)}%`}
          </div>
        </div>
      </div>
      <div
        style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)", textAlign: "center" }}
      >
        {title}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
        Target: {unit === "ms" ? `<${target}ms` : `≥${target}%`}
      </div>
      <Badge
        variant={good ? "success" : "error"}
        style={{
          fontSize: 11,
          borderRadius: 12,
          background: good ? APP_COLORS.rgba_18_183_106_0p12 : APP_COLORS.rgba_240_68_56_0p12_2,
          color: good ? APP_COLORS.hex_12b76a : APP_COLORS.hex_f04438,
          border: `1px solid ${good ? APP_COLORS.rgba_18_183_106_0p3 : APP_COLORS.rgba_240_68_56_0p3_2}`,
        }}
      >
        {good ? "Meeting SLO" : "Breaching SLO"}
      </Badge>
      {description && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
          {description}
        </div>
      )}
    </div>
  );
}

/**
 *
 * @param root0
 * @param root0.isLoading
 * @param root0.availabilityPct
 * @param root0.p95Ms
 * @param root0.errorBudget
 * @param root0.isCompliant
 * @param root0.compliancePct
 * @param root0.timeseriesLength
 * @param root0.breachedCount
 * @param root0.totalRequests
 * @param root0.averageLatencyMs
 * @param root0.availabilityTarget
 * @param root0.p95TargetMs
 */
export default function SloHealthGauges({
  isLoading,
  availabilityPct,
  p95Ms,
  errorBudget,
  isCompliant,
  compliancePct,
  timeseriesLength,
  breachedCount,
  totalRequests,
  averageLatencyMs,
  availabilityTarget,
  p95TargetMs,
}: SloHealthGaugesProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Surface elevation={1} padding="md">
        <h4>
          <ShieldCheck size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
          SLO Health
        </h4>
        {isLoading ? (
          <Skeleton />
        ) : (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <SloGauge
              title="Availability"
              value={availabilityPct}
              target={availabilityTarget}
              unit="%"
              description={`${n(totalRequests).toLocaleString()} total requests`}
            />
            <SloGauge
              title="P95 Latency"
              value={p95Ms}
              target={p95TargetMs}
              unit="ms"
              description={`Avg: ${n(averageLatencyMs).toFixed(1)}ms`}
            />
            <SloGauge
              title="Error Budget"
              value={errorBudget}
              target={50}
              unit="%"
              description={`${(100 - availabilityTarget).toFixed(1)}% total budget`}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "20px 24px",
                background: `var(--bg-tertiary, ${APP_COLORS.hex_1a1a1a_2})`,
                borderRadius: 8,
                border: `1px solid var(--border-color, ${APP_COLORS.hex_2d2d2d})`,
                minWidth: 160,
                flex: 1,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: isCompliant ? APP_COLORS.hex_12b76a : APP_COLORS.hex_f04438,
                }}
              >
                {compliancePct}%
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                Window Compliance
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                {timeseriesLength - breachedCount} / {timeseriesLength} windows compliant
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                SLO Target: {availabilityTarget}%
              </div>
            </div>
          </div>
        )}
      </Surface>
    </div>
  );
}
