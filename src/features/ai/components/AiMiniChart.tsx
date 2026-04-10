/**
 * AI Observability — Inline time-series chart wrapper over UPlotChart.
 * Replaces pure SVG with the standard UPlot charting library per user request.
 */
import { useMemo } from "react";
import UPlotChart, { defaultAxes, uLine } from "@shared/components/ui/charts/UPlotChart";

interface AiMiniChartProps {
  data: { timestamp: string; value: number }[];
  height?: number;
  color?: string;
  fillOpacity?: number;
  label?: string;
  formatValue?: (v: number) => string;
}

export function AiMiniChart({
  data,
  height = 80,
  color = "#6366f1",
  label,
  formatValue = (v) => String(Math.round(v)),
}: AiMiniChartProps) {
  const { uplotData, latestValue } = useMemo(() => {
    if (!data || data.length === 0) return { uplotData: [[] as number[], [] as number[]], latestValue: 0 };
    
    // UPlot requires timestamps in seconds
    const timestamps = data.map((d) => Math.floor(new Date(d.timestamp).getTime() / 1000));
    const values = data.map((d) => d.value);
    
    return {
      uplotData: [timestamps, values] as uPlot.AlignedData,
      latestValue: values[values.length - 1],
    };
  }, [data]);

  const opts = useMemo(() => {
    return {
      axes: defaultAxes({ yAxisSize: 40 }),
      series: [
        {}, // X axis
        uLine(label || "Value", color, { fill: true, width: 1.5 }),
      ],
      cursor: { show: false },
      legend: { show: false },
    } as any;
  }, [color, label]);

  if (!data?.length) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted, #8b8fa3)",
          fontSize: 12,
        }}
      >
        No data
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted, #8b8fa3)",
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary, #e8eaf0)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatValue(latestValue)}
          </span>
        </div>
      )}
      <UPlotChart options={opts} data={uplotData as any} height={height} />
    </div>
  );
}

/**
 * Multi-series variant — renders multiple overlapping series using UPlot.
 */
interface AiMultiSeriesChartProps {
  series: {
    data: { timestamp: string; value: number }[];
    color: string;
    label: string;
  }[];
  height?: number;
}

export function AiMultiSeriesChart({ series, height = 80 }: AiMultiSeriesChartProps) {
  const { uplotData, labelsAndColors } = useMemo(() => {
    if (!series || series.length === 0) return { uplotData: [[]], labelsAndColors: [] };

    // Standardize all timestamps across series
    const timeSet = new Set<number>();
    for (const s of series) {
      for (const d of s.data) {
        timeSet.add(Math.floor(new Date(d.timestamp).getTime() / 1000));
      }
    }
    
    if (timeSet.size === 0) return { uplotData: [[]], labelsAndColors: [] };
    
    const timestamps = Array.from(timeSet).sort((a, b) => a - b);
    const dataArrays: number[][] = [timestamps];
    const lc: { label: string; color: string }[] = [];

    for (const s of series) {
      lc.push({ label: s.label, color: s.color });
      const valuesMap = new Map<number, number>();
      for (const d of s.data) {
        valuesMap.set(Math.floor(new Date(d.timestamp).getTime() / 1000), d.value);
      }
      const values = timestamps.map((t) => valuesMap.get(t) ?? 0);
      dataArrays.push(values);
    }

    return {
      uplotData: dataArrays as unknown as uPlot.AlignedData,
      labelsAndColors: lc,
    };
  }, [series]);

  const opts = useMemo(() => {
    return {
      axes: defaultAxes({ yAxisSize: 40 }),
      series: [
        {}, // X axis
        ...labelsAndColors.map((lc) => uLine(lc.label, lc.color, { fill: false, width: 1.5 })),
      ],
      cursor: { show: false },
      legend: { show: false },
    } as any;
  }, [labelsAndColors]);

  const totalPoints = uplotData[0]?.length ?? 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        {labelsAndColors.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 8,
                height: 3,
                borderRadius: 2,
                background: s.color,
              }}
            />
            <span style={{ fontSize: 10, color: "var(--text-muted, #8b8fa3)" }}>{s.label}</span>
          </div>
        ))}
      </div>
      
      {totalPoints === 0 ? (
        <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>
          No data
        </div>
      ) : (
        <UPlotChart options={opts} data={uplotData as any} height={height} />
      )}
    </div>
  );
}
