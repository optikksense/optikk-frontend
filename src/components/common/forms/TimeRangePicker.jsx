import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import { useAppStore } from '@store/appStore';

/* ── Relative presets ── */
const RELATIVE_RANGES = [
  { label: 'Last 5 minutes', value: '5m', minutes: 5 },
  { label: 'Last 15 minutes', value: '15m', minutes: 15 },
  { label: 'Last 30 minutes', value: '30m', minutes: 30 },
  { label: 'Last 1 hour', value: '1h', minutes: 60 },
  { label: 'Last 3 hours', value: '3h', minutes: 180 },
  { label: 'Last 6 hours', value: '6h', minutes: 360 },
  { label: 'Last 12 hours', value: '12h', minutes: 720 },
  { label: 'Last 24 hours', value: '24h', minutes: 1440 },
  { label: 'Last 2 days', value: '2d', minutes: 2880 },
  { label: 'Last 7 days', value: '7d', minutes: 10080 },
  { label: 'Last 30 days', value: '30d', minutes: 43200 },
  { label: 'Last 90 days', value: '90d', minutes: 129600 },
];

/* ── Helpers ── */
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const pad = (n) => String(n).padStart(2, '0');

function fmtDatetime(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function fmtShort(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function parseDatetime(str) {
  const d = new Date(str.replace(' ', 'T'));
  return isNaN(d.getTime()) ? null : d;
}

/* ── Mini Calendar ── */
function MiniCalendar({ selectedDate, onSelectDate, calMonth, calYear, setCalMonth, setCalYear }) {
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

  const cells = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  const today = new Date();
  const isToday = (d) => d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const isSelected = (d) => selectedDate && d === selectedDate.getDate() && calMonth === selectedDate.getMonth() && calYear === selectedDate.getFullYear();

  return (
    <div className="gf-cal">
      <div className="gf-cal__nav">
        <button className="gf-cal__nav-btn" onClick={prevMonth}><ChevronLeft size={14} /></button>
        <span className="gf-cal__month">{MONTHS[calMonth]} {calYear}</span>
        <button className="gf-cal__nav-btn" onClick={nextMonth}><ChevronRight size={14} /></button>
      </div>
      <div className="gf-cal__grid">
        {DAYS.map((d) => <div key={d} className="gf-cal__dow">{d}</div>)}
        {cells.map((c, i) => (
          <button
            key={i}
            className={[
              'gf-cal__day',
              !c.current && 'gf-cal__day--other',
              c.current && isToday(c.day) && 'gf-cal__day--today',
              c.current && isSelected(c.day) && 'gf-cal__day--selected',
            ].filter(Boolean).join(' ')}
            onClick={() => { if (c.current) onSelectDate(new Date(calYear, calMonth, c.day)); }}
          >
            {c.day}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function TimeRangePicker() {
  const { timeRange, setTimeRange, setCustomTimeRange } = useAppStore();
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const wrapperRef = useRef(null);

  const now = new Date();
  const [fromStr, setFromStr] = useState(fmtDatetime(new Date(now.getTime() - 3600000)));
  const [toStr, setToStr] = useState(fmtDatetime(now));
  const [editingField, setEditingField] = useState('from');
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [recentRanges, setRecentRanges] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    setShowCustom(false);
  };

  const selectRelative = (range) => {
    setTimeRange(range);
    setOpen(false);
    setShowCustom(false);
  };

  const openCustom = () => {
    const n = new Date();
    setFromStr(fmtDatetime(new Date(n.getTime() - (timeRange.minutes || 60) * 60000)));
    setToStr(fmtDatetime(n));
    setCalMonth(n.getMonth());
    setCalYear(n.getFullYear());
    setEditingField('from');
    setShowCustom(true);
  };

  const handleCalSelect = (date) => {
    const current = editingField === 'from' ? fromStr : toStr;
    const parsed = parseDatetime(current);
    const h = parsed ? parsed.getHours() : 0;
    const m = parsed ? parsed.getMinutes() : 0;
    const s = parsed ? parsed.getSeconds() : 0;
    date.setHours(h, m, s);
    const newStr = fmtDatetime(date);
    if (editingField === 'from') setFromStr(newStr);
    else setToStr(newStr);
  };

  const applyAbsolute = () => {
    const start = parseDatetime(fromStr);
    const end = parseDatetime(toStr);
    if (!start || !end || start >= end) return;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    const label = `${fmtShort(start)} to ${fmtShort(end)}`;
    setCustomTimeRange({ label, value: 'custom', minutes: diffMin, startTime: start.getTime(), endTime: end.getTime() });
    setRecentRanges((prev) => {
      const next = [{ label, from: fromStr, to: toStr }, ...prev.filter((r) => r.label !== label)];
      return next.slice(0, 4);
    });
    setOpen(false);
    setShowCustom(false);
  };

  const applyRecent = (r) => {
    setFromStr(r.from);
    setToStr(r.to);
    const start = parseDatetime(r.from);
    const end = parseDatetime(r.to);
    if (!start || !end) return;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    setCustomTimeRange({ label: r.label, value: 'custom', minutes: diffMin, startTime: start.getTime(), endTime: end.getTime() });
    setOpen(false);
    setShowCustom(false);
  };

  const displayLabel = timeRange.label || 'Last 12 hours';

  return (
    <div className="gf-tp" ref={wrapperRef}>
      <button className="gf-tp__trigger" onClick={handleOpen}>
        <Clock size={14} className="gf-tp__trigger-icon" />
        <span className="gf-tp__trigger-label">{displayLabel}</span>
        <ChevronDown size={12} style={{ opacity: 0.4 }} />
      </button>

      {open && (
        <div className={`gf-tp__dropdown ${showCustom ? 'gf-tp__dropdown--expanded' : ''}`}>

          {/* Relative Ranges — always visible */}
          <div className="gf-tp__col gf-tp__col-relative">
            <div className="gf-tp__section-title">Relative time ranges</div>
            <div className="gf-tp__relative-list">
              {RELATIVE_RANGES.map((r) => (
                <button
                  key={r.value}
                  className={`gf-tp__relative-item ${timeRange.value === r.value ? 'gf-tp__relative-item--active' : ''}`}
                  onClick={() => selectRelative(r)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {/* Custom trigger */}
            <button className="gf-tp__custom-trigger" onClick={openCustom}>
              <Calendar size={13} />
              Custom time range
            </button>
          </div>

          {/* Calendar + Absolute — only after clicking "Custom time range" */}
          {showCustom && (
            <>
              <div className="gf-tp__col gf-tp__col-calendar">
                <MiniCalendar
                  selectedDate={parseDatetime(editingField === 'from' ? fromStr : toStr)}
                  onSelectDate={handleCalSelect}
                  calMonth={calMonth} calYear={calYear}
                  setCalMonth={setCalMonth} setCalYear={setCalYear}
                />
              </div>

              <div className="gf-tp__col gf-tp__col-absolute">
                <div className="gf-tp__section-title">Absolute time range</div>
                <label className="gf-tp__input-label">From</label>
                <input
                  className={`gf-tp__input ${editingField === 'from' ? 'gf-tp__input--active' : ''}`}
                  value={fromStr}
                  onChange={(e) => setFromStr(e.target.value)}
                  onFocus={() => setEditingField('from')}
                />
                <label className="gf-tp__input-label">To</label>
                <input
                  className={`gf-tp__input ${editingField === 'to' ? 'gf-tp__input--active' : ''}`}
                  value={toStr}
                  onChange={(e) => setToStr(e.target.value)}
                  onFocus={() => setEditingField('to')}
                />
                <button className="gf-tp__apply-btn" onClick={applyAbsolute}>Apply time range</button>

                {recentRanges.length > 0 && (
                  <>
                    <div className="gf-tp__recent-title">Recently used</div>
                    {recentRanges.map((r, i) => (
                      <button key={i} className="gf-tp__recent-item" onClick={() => applyRecent(r)}>{r.label}</button>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
