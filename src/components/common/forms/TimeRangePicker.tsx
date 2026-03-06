import { APP_COLORS } from '@config/colorLiterals';
import { Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { useAppStore } from '@store/appStore';

/* ── Categorised presets ── */
const RANGE_GROUPS = [
  {
    title: 'Minutes',
    items: [
      { label: '5m', value: '5m', minutes: 5 },
      { label: '15m', value: '15m', minutes: 15 },
      { label: '30m', value: '30m', minutes: 30 },
    ],
  },
  {
    title: 'Hours',
    items: [
      { label: '1h', value: '1h', minutes: 60 },
      { label: '3h', value: '3h', minutes: 180 },
      { label: '6h', value: '6h', minutes: 360 },
      { label: '12h', value: '12h', minutes: 720 },
      { label: '24h', value: '24h', minutes: 1440 },
    ],
  },
  {
    title: 'Days',
    items: [
      { label: '2d', value: '2d', minutes: 2880 },
      { label: '7d', value: '7d', minutes: 10080 },
      { label: '30d', value: '30d', minutes: 43200 },
      { label: '90d', value: '90d', minutes: 129600 },
    ],
  },
];

/* ── Helpers ── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const pad = (n: number) => String(n).padStart(2, '0');

function fmtDatetime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDatetime(str: string): Date | null {
  const d = new Date(str.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

function dayInRange(day: Date, from: Date | null, to: Date | null) {
  if (!from || !to) return false;
  const t = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return t > Math.min(a, b) && t < Math.max(a, b);
}

/* human-readable display label */
const DISPLAY_MAP: Record<string, string> = {
  '5m': 'Last 5 min', '15m': 'Last 15 min', '30m': 'Last 30 min',
  '1h': 'Last 1 hour', '3h': 'Last 3 hours', '6h': 'Last 6 hours',
  '12h': 'Last 12 hours', '24h': 'Last 24 hours',
  '2d': 'Last 2 days', '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days',
};

/* ── Mini Calendar with range highlighting ── */
function MiniCalendar({
  fromDate,
  toDate,
  onSelectDate,
  calMonth,
  calYear,
  setCalMonth,
  setCalYear,
}: {
  fromDate: Date | null;
  toDate: Date | null;
  onSelectDate: (d: Date) => void;
  calMonth: number;
  calYear: number;
  setCalMonth: (m: number) => void;
  setCalYear: (y: number) => void;
}) {
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const firstDay = new Date(calYear, calMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const cells: Array<{ day: number; current: boolean }> = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  const today = new Date();
  const isToday = (d: number) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const isFrom = (d: number) => fromDate && d === fromDate.getDate() && calMonth === fromDate.getMonth() && calYear === fromDate.getFullYear();
  const isTo = (d: number) => toDate && d === toDate.getDate() && calMonth === toDate.getMonth() && calYear === toDate.getFullYear();
  const isInRange = (d: number) => {
    if (!fromDate || !toDate) return false;
    const cellDate = new Date(calYear, calMonth, d);
    return dayInRange(cellDate, fromDate, toDate);
  };

  return (
    <div className="trp-cal" style={{ marginBottom: 4 }}>
      <div className="trp-cal__nav" style={{ marginBottom: 2 }}>
        <button className="trp-cal__nav-btn" onClick={prevMonth} aria-label="Previous month" style={{ padding: 2 }}>
          <ChevronLeft size={13} />
        </button>
        <span className="trp-cal__month" style={{ fontSize: 11, fontWeight: 600 }}>{MONTHS[calMonth]} {calYear}</span>
        <button className="trp-cal__nav-btn" onClick={nextMonth} aria-label="Next month" style={{ padding: 2 }}>
          <ChevronRight size={13} />
        </button>
      </div>
      <div className="trp-cal__grid" style={{ gap: 0 }}>
        {DAYS.map((d) => <div key={d} className="trp-cal__dow" style={{ fontSize: 9, padding: '1px 0', opacity: 0.7 }}>{d}</div>)}
        {cells.map((c, i) => {
          const isRangeStart = c.current && isFrom(c.day);
          const isRangeEnd = c.current && isTo(c.day);
          const inRange = c.current && isInRange(c.day);
          return (
            <button
              key={i}
              className={[
                'trp-cal__day',
                !c.current && 'trp-cal__day--other',
                c.current && isToday(c.day) && !isRangeStart && !isRangeEnd && 'trp-cal__day--today',
                isRangeStart && 'trp-cal__day--range-start',
                isRangeEnd && 'trp-cal__day--range-end',
                inRange && 'trp-cal__day--in-range',
              ].filter(Boolean).join(' ')}
              onClick={() => { if (c.current) onSelectDate(new Date(calYear, calMonth, c.day)); }}
              tabIndex={c.current ? 0 : -1}
              style={{ fontSize: 10, padding: '2px 0', lineHeight: 1.25 }}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ── */
/**
 *
 */
export default function TimeRangePicker() {
  const { timeRange, setTimeRange, setCustomTimeRange } = useAppStore();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [fromStr, setFromStr] = useState(fmtDatetime(new Date(now.getTime() - 3600000)));
  const [toStr, setToStr] = useState(fmtDatetime(now));
  const [editingField, setEditingField] = useState<'from' | 'to'>('from');
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  /* Outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleToggle = useCallback(() => {
    if (!open) {
      const n = new Date();
      setFromStr(fmtDatetime(new Date(n.getTime() - (timeRange.minutes || 60) * 60000)));
      setToStr(fmtDatetime(n));
      setCalMonth(n.getMonth());
      setCalYear(n.getFullYear());
      setEditingField('from');
    }
    setOpen((v) => !v);
  }, [open, timeRange.minutes]);

  const selectRelative = (range: { label: string; value: string; minutes: number }) => {
    setTimeRange(range);
    setOpen(false);
  };

  /* Calendar date pick — auto-advance from → to */
  const handleCalSelect = (date: Date) => {
    if (editingField === 'from') {
      const parsed = parseDatetime(fromStr);
      date.setHours(parsed ? parsed.getHours() : 0, parsed ? parsed.getMinutes() : 0, 0);
      setFromStr(fmtDatetime(date));
      // Auto-advance to "To" field
      setEditingField('to');
    } else {
      const parsed = parseDatetime(toStr);
      date.setHours(parsed ? parsed.getHours() : 23, parsed ? parsed.getMinutes() : 59, 0);
      setToStr(fmtDatetime(date));
    }
  };

  const applyAbsolute = () => {
    const start = parseDatetime(fromStr);
    const end = parseDatetime(toStr);
    if (!start || !end || start >= end) return;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    const label = `${fmtDatetime(start)} → ${fmtDatetime(end)}`;
    setCustomTimeRange({ label, value: 'custom', minutes: diffMin, startTime: start.getTime(), endTime: end.getTime() });
    setOpen(false);
  };

  const displayLabel = timeRange.value === 'custom'
    ? timeRange.label
    : (DISPLAY_MAP[timeRange.value] || timeRange.label || 'Last 1 hour');

  return (
    <div className="trp" ref={wrapperRef}>
      <button
        className={`trp__trigger ${open ? 'trp__trigger--open' : ''}`}
        onClick={handleToggle}
        data-testid="time-range-trigger"
      >
        <Clock size={14} className="trp__trigger-icon" />
        <span className="trp__trigger-label">{displayLabel}</span>
        <ChevronDown size={12} className={`trp__trigger-chevron ${open ? 'trp__trigger-chevron--open' : ''}`} />
      </button>

      {open && (
        <div className="trp__dropdown" data-testid="time-range-dropdown">
          {/* Left — Quick Ranges */}
          <div className="trp__panel trp__panel--quick" style={{ padding: '6px 8px' }}>
            <span className="trp__panel-title" style={{ display: 'none' }}>Quick Ranges</span>
            {RANGE_GROUPS.map((group) => (
              <div key={group.title} className="trp__group" style={{ marginBottom: 2 }}>
                <span className="trp__group-label" style={{ display: 'block', fontSize: 9, fontWeight: 500, color: APP_COLORS.hex_666, marginBottom: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group.title}</span>
                <div className="trp__pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {group.items.map((item) => (
                    <button
                      key={item.value}
                      className={`trp__pill ${timeRange.value === item.value ? 'trp__pill--active' : ''}`}
                      onClick={() => selectRelative(item)}
                      style={{ padding: '2px 8px', fontSize: 11 }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="trp__divider" />

          {/* Right — Custom Range */}
          <div className="trp__panel trp__panel--custom" style={{ padding: '6px 8px' }}>
            <span className="trp__panel-title" style={{ display: 'none' }}>Custom Range</span>

            <MiniCalendar
              fromDate={parseDatetime(fromStr)}
              toDate={parseDatetime(toStr)}
              onSelectDate={handleCalSelect}
              calMonth={calMonth} calYear={calYear}
              setCalMonth={setCalMonth} setCalYear={setCalYear}
            />

            <div className="trp__inputs" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="trp__field" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <label className="trp__field-label" style={{ fontSize: 9, fontWeight: 600, color: APP_COLORS.hex_555, textTransform: 'uppercase' }}>From</label>
                <input
                  className={`trp__input ${editingField === 'from' ? 'trp__input--active' : ''}`}
                  value={fromStr} onChange={(e) => setFromStr(e.target.value)}
                  onFocus={() => setEditingField('from')}
                  style={{ padding: '2px 6px', fontSize: 11, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="trp__field" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <label className="trp__field-label" style={{ fontSize: 9, fontWeight: 600, color: APP_COLORS.hex_555, textTransform: 'uppercase' }}>To</label>
                <input
                  className={`trp__input ${editingField === 'to' ? 'trp__input--active' : ''}`}
                  value={toStr} onChange={(e) => setToStr(e.target.value)}
                  onFocus={() => setEditingField('to')}
                  style={{ padding: '2px 6px', fontSize: 11, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button className="trp__apply" onClick={applyAbsolute} style={{ display: 'block', width: '100%', padding: '4px 0', marginTop: 8, fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', background: APP_COLORS.hex_5e60ce, color: APP_COLORS.hex_fff, cursor: 'pointer' }}>Apply Range</button>
          </div>
        </div>
      )}
    </div>
  );
}
