import { memo, useMemo } from "react";
import type uPlot from "uplot";
import type { MonitorSeriesResponse } from "../../api/monitorsApi";
import ObservabilityChart, { type ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";

interface Props {
  readonly data: MonitorSeriesResponse | undefined;
  readonly loading: boolean;
}

function thresholdLinesPlugin(warn?: number, alert?: number): uPlot.Plugin {
  return {
    hooks: {
      draw: (u) => {
        const { ctx } = u;
        const xMin = u.bbox.left;
        const xMax = xMin + u.bbox.width;

        const drawLine = (val: number, color: string) => {
          const y = u.valToPos(val, "y", true);
          // Don't draw if outside the plot area
          if (y < u.bbox.top || y > u.bbox.top + u.bbox.height) return;
          
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(xMin, y);
          ctx.lineTo(xMax, y);
          ctx.stroke();
          ctx.restore();
        };

        if (warn !== undefined) drawLine(warn, "#f59e0b");
        if (alert !== undefined) drawLine(alert, "#ef4444");
      },
    },
  };
}

function EvalChartCard({ data, loading }: Props) {
  const timestamps = useMemo(() => {
    if (!data?.points) return [];
    return data.points.map((p) => Math.floor(p.bucket_ms / 1000));
  }, [data]);

  const series = useMemo<ObservabilityChartSeries[]>(() => {
    if (!data?.points) return [];
    return [
      {
        label: "Value",
        values: data.points.map((p) => p.value),
        color: "#ef4444",
        fill: true,
      }
    ];
  }, [data]);

  const plugins = useMemo(() => {
    if (!data) return [];
    return [thresholdLinesPlugin(data.warn_threshold, data.alert_threshold)];
  }, [data]);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-medium text-foreground text-sm">Evaluation · last 1 hour</div>
          <div className="text-[11px] text-foreground-muted">
            line is monitor value · bands show thresholds
          </div>
        </div>
        {data && (
          <div className="flex items-center gap-3 text-[11px] text-foreground-muted">
            {data.warn_threshold !== undefined && (
              <span className="font-mono">warn ≥ {data.warn_threshold}</span>
            )}
            {data.alert_threshold !== undefined && (
              <span className="font-mono">alert ≥ {data.alert_threshold}</span>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-3 h-[180px] w-full">
        {loading && !data ? (
          <div className="flex h-full items-center justify-center text-foreground-muted text-xs">
            Loading…
          </div>
        ) : !data || data.points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-foreground-muted text-xs">
            No data yet for this monitor.
          </div>
        ) : (
          <ObservabilityChart
            type="area"
            timestamps={timestamps}
            series={series}
            plugins={plugins}
            height={180}
            fillHeight
          />
        )}
      </div>
    </div>
  );
}

export default memo(EvalChartCard);
