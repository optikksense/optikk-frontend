import { useEffect, useRef, useState } from 'react';

/* ── tiny sparkline helper ─────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 96, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h * 0.85 - 2;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M 0,${h} L ${pts.join(' L ')} L ${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={pathD} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── animated counter ───────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ── KPI card ───────────────────────────────────────────────────────── */
function KpiCard({
  label, rawVal, displayFn, spark, color, trend,
}: {
  label: string; rawVal: number; displayFn: (n: number) => string;
  spark: number[]; color: string; trend: string;
}) {
  const val = useCountUp(rawVal);
  const trendPositive = trend.startsWith('+');
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#F1F5F9', lineHeight: 1.1 }}>{displayFn(val)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: trendPositive ? '#10B981' : '#EF4444' }}>{trend}</span>
        <Sparkline data={spark} color={color} />
      </div>
    </div>
  );
}

/* ── donut ring ─────────────────────────────────────────────────────── */
function DonutRing({ label, pct, color }: { label: string; pct: number; color: string }) {
  const r = 22, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const [dash, setDash] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setDash(offset), 300);
    return () => clearTimeout(t);
  }, [offset]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={56} height={56} viewBox="0 0 56 56">
        <circle cx={28} cy={28} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle
          cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round" transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x={28} y={33} textAnchor="middle"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, fill: '#F1F5F9', fontWeight: 600 }}
        >{pct}%</text>
      </svg>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#64748B', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
    </div>
  );
}

/* ── sidebar nav item ───────────────────────────────────────────────── */
const SidebarItem = ({ icon, label, active }: { icon: string; label: string; active?: boolean }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
    borderRadius: 7, cursor: 'pointer',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#818CF8' : '#64748B',
    fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400,
    borderLeft: active ? '2px solid #6366F1' : '2px solid transparent',
    transition: 'all 0.15s',
  }}>
    <span style={{ fontSize: 12 }}>{icon}</span>
    <span>{label}</span>
  </div>
);

const SPARK_REQUESTS = [42, 58, 51, 63, 57, 71, 65, 74, 69, 75];
const SPARK_ERROR    = [1.1, 0.9, 1.3, 0.8, 1.0, 0.7, 0.9, 1.1, 0.8, 0.9];
const SPARK_LATENCY  = [48, 53, 45, 58, 51, 47, 55, 50, 53, 51];
const SPARK_P99      = [142, 165, 151, 172, 157, 148, 163, 155, 160, 157];

export default function DashboardMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{
      width: '100%',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 32px 80px -20px rgba(0,0,0,0.7)',
      background: '#0D0E14',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Browser chrome */}
      <div style={{
        background: '#161720', padding: '10px 16px', display: 'flex',
        alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
          ))}
        </div>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6,
          padding: '3px 12px', fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ color: '#10B981' }}>●</span> app.optikk.io/overview
        </div>
      </div>

      {/* App shell */}
      <div style={{ display: 'flex', height: compact ? 280 : 360 }}>
        {/* Sidebar */}
        <div style={{
          width: 140, background: '#0F1018', borderRight: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
        }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 10px', marginBottom: 6 }}>Navigation</div>
          <SidebarItem icon="◉" label="Overview" active />
          <SidebarItem icon="▦" label="Metrics" />
          <SidebarItem icon="≡" label="Logs" />
          <SidebarItem icon="⌀" label="Traces" />
          <SidebarItem icon="⬡" label="Services" />
          <SidebarItem icon="⊞" label="Integrations" />
          <SidebarItem icon="✦" label="AI Observ." />
          <SidebarItem icon="⚑" label="Alerts" />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 15, color: '#F1F5F9' }}>Overview</div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
              color: '#6366F1', background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '3px 8px',
            }}>Last 30m ▾</div>
          </div>

          {/* KPI grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <KpiCard label="Total Requests" rawVal={7500} displayFn={n => n >= 1000 ? `${(n/1000).toFixed(1)}K` : String(n)} spark={SPARK_REQUESTS} color="#6366F1" trend="+12.4%" />
            <KpiCard label="Error Rate" rawVal={90} displayFn={n => `${(n/100).toFixed(1)}%`} spark={SPARK_ERROR} color="#EF4444" trend="-0.2%" />
            <KpiCard label="Avg Latency" rawVal={51} displayFn={n => `${n}ms`} spark={SPARK_LATENCY} color="#22D3EE" trend="+3ms" />
            <KpiCard label="P99 Latency" rawVal={157} displayFn={n => `${n}ms`} spark={SPARK_P99} color="#F59E0B" trend="-8ms" />
          </div>

          {/* Donut rings */}
          {!compact && (
            <div style={{
              display: 'flex', gap: 0, justifyContent: 'space-around',
              background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '12px 8px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <DonutRing label="Availability" pct={99.1} color="#10B981" />
              <DonutRing label="P95 Latency" pct={100} color="#6366F1" />
              <DonutRing label="Error Budget" pct={91} color="#22D3EE" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
