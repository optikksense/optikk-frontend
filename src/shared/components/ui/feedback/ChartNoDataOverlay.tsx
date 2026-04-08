import { AlertTriangle } from "lucide-react";

export default function ChartNoDataOverlay() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(245,158,11,0.12)]">
        <AlertTriangle size={22} className="text-[#f59e0b]" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[#f59e0b] text-[13px]">No data available</span>
        <span className="max-w-[280px] text-[#b0b4ba] text-[12px] leading-relaxed">
          No data was returned for this time range. Try expanding the time window or check that data
          is being ingested.
        </span>
      </div>
    </div>
  );
}
