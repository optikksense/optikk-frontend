import { AlertTriangle } from "lucide-react";

export default function ChartNoDataOverlay() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-subtle">
        <AlertTriangle size={22} className="text-warning" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[13px] text-warning">No data available</span>
        <span className="max-w-[280px] text-[12px] text-foreground-secondary leading-relaxed">
          No data was returned for this time range. Try expanding the time window or check that data
          is being ingested.
        </span>
      </div>
    </div>
  );
}
