import { useAppStore } from "@app/store/appStore";
import type { TimeRange } from "@shared/types";
import { subMonths } from "date-fns";
import { useEffect, useState } from "react";
import { DualCalendar } from "./DualCalendar";
import { fmtDatetime, parseDatetime } from "./utils";

interface Props {
  timeRange: TimeRange;
  onClose: () => void;
}

export function AbsoluteTimeTab({ timeRange, onClose }: Props) {
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);

  const [leftMonth, setLeftMonth] = useState(() => subMonths(new Date(), 1));
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingMode, setSelectingMode] = useState(false);

  const [fromStr, setFromStr] = useState("");
  const [toStr, setToStr] = useState("");

  useEffect(() => {
    const n = new Date();
    const durationMs =
      timeRange.kind === "relative"
        ? timeRange.minutes * 60000
        : timeRange.endMs - timeRange.startMs;
    const startDate = new Date(n.getTime() - durationMs);
    setFromStr(fmtDatetime(startDate));
    setToStr(fmtDatetime(n));
    setLeftMonth(subMonths(n, 1));
    setRangeStart(startDate);
    setRangeEnd(n);
    setSelectingMode(false);
    setHoverDate(null);
  }, [timeRange]);

  const handleCalSelect = (date: Date) => {
    if (!selectingMode || !rangeStart) {
      setRangeStart(date);
      setRangeEnd(null);
      setSelectingMode(true);
      setFromStr(fmtDatetime(date));
    } else {
      const start = date < rangeStart ? date : rangeStart;
      const end = date < rangeStart ? rangeStart : date;
      setRangeStart(start);
      setRangeEnd(end);
      setSelectingMode(false);
      setFromStr(fmtDatetime(start));
      setToStr(fmtDatetime(end));
    }
  };

  const applyAbsolute = () => {
    const start = parseDatetime(fromStr);
    const end = parseDatetime(toStr);
    if (!start || !end || start >= end) return;
    const label = `${fmtDatetime(start)} to ${fmtDatetime(end)}`;
    setCustomTimeRange(start.getTime(), end.getTime(), label);
    onClose();
  };

  return (
    <div className="flex flex-col">
      <DualCalendar
        leftMonth={leftMonth}
        setLeftMonth={setLeftMonth}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        hoverDate={hoverDate}
        selectingMode={selectingMode}
        onSelectDate={handleCalSelect}
        onHoverDate={setHoverDate}
      />

      <div className="border-border border-t px-3 pt-1 pb-3">
        <div className="mt-3 flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="font-semibold text-[11px] text-foreground-tertiary uppercase tracking-wider">
              From
            </label>
            <input
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[13px] text-foreground outline-none transition-colors hover:border-foreground-tertiary focus:border-primary"
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={fromStr}
              onChange={(e) => setFromStr(e.target.value)}
            />
          </div>
          <div className="flex items-end pb-1.5 text-[13px] text-foreground-tertiary">to</div>
          <div className="flex flex-1 flex-col gap-1">
            <label className="font-semibold text-[11px] text-foreground-tertiary uppercase tracking-wider">
              To
            </label>
            <input
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[13px] text-foreground outline-none transition-colors hover:border-foreground-tertiary focus:border-primary"
              placeholder="YYYY-MM-DD HH:mm:ss"
              value={toStr}
              onChange={(e) => setToStr(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-3 w-full cursor-pointer rounded-md border-none bg-primary py-2 font-semibold text-[13px] text-white transition-opacity hover:opacity-90"
          onClick={applyAbsolute}
        >
          Apply time range
        </button>
      </div>
    </div>
  );
}
