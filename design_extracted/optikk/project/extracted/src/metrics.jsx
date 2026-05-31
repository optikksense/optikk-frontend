/* global React, Icon, AreaSpark, MiniSpark, Bars, seededWave, PageHeader, Tabs */
const { useState: useStateD, useMemo: useMemoD, useEffect: useEffectD, useRef: useRefD } = React;

/* =========================================================
   BIG MULTI-SERIES CHART
   - Custom inline SVG with grid, axis labels, deploy markers,
     hover cursor + readout. Original to Optikk.
   ========================================================= */
function BigChart({
  series,            // [{ id, label, color, soft, data: number[] (0..1), value, unit }]
  height = 360,
  type = "area",     // "area" | "line" | "bar"
  showGrid = true,
  yTicks = 5,
  xLabels = ["−4h","−3h","−2h","−1h","30m","now"],
  yUnit = "ms",
  yScale = [0, 400], // for axis labels
  deployMarkers = [],
  showCursor = true,
}) {
  const w = 1200;
  const h = height;
  const padL = 56, padR = 18, padT = 14, padB = 32;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const N = series[0].data.length;
  const [hoverX, setHoverX] = useStateD(0.66);

  const xx = (i) => padL + (i / (N - 1)) * innerW;
  const yy = (v) => padT + (1 - v) * innerH;

  const pathLine = (data) => "M " + data.map((v, i) => `${xx(i).toFixed(1)},${yy(v).toFixed(1)}`).join(" L ");
  const pathArea = (data) => pathLine(data) + ` L ${xx(N - 1).toFixed(1)},${yy(0).toFixed(1)} L ${xx(0).toFixed(1)},${yy(0).toFixed(1)} Z`;

  const cursorI = Math.round(hoverX * (N - 1));
  const cursorX = xx(cursorI);

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const xPx = x * w;
    const frac = Math.min(1, Math.max(0, (xPx - padL) / innerW));
    setHoverX(frac);
  }

  // y label values
  const ticks = Array.from({ length: yTicks }).map((_, i) => i / (yTicks - 1));

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        preserveAspectRatio="none"
        style={{ display: "block", cursor: "crosshair" }}
        onMouseMove={onMove}
      >
        {/* horizontal grid */}
        {showGrid && ticks.map((t, i) => (
          <line key={"g" + i} x1={padL} x2={w - padR} y1={yy(t)} y2={yy(t)} stroke="var(--line-2)" strokeDasharray={i === 0 ? "" : "3 3"} />
        ))}
        {/* vertical grid */}
        {showGrid && xLabels.map((_, i) => {
          const x = padL + (i / (xLabels.length - 1)) * innerW;
          return <line key={"vg" + i} x1={x} x2={x} y1={padT} y2={padT + innerH} stroke="var(--line-2)" strokeDasharray="3 3" opacity="0.6" />;
        })}
        {/* y axis labels */}
        {ticks.map((t, i) => (
          <text key={"yl" + i} x={padL - 8} y={yy(t) + 3.5}
                textAnchor="end" fontSize="10.5" fill="var(--fg-mute)"
                fontFamily="var(--font-mono)">
            {Math.round(yScale[0] + t * (yScale[1] - yScale[0]))}
          </text>
        ))}
        {/* x axis labels */}
        {xLabels.map((lab, i) => {
          const x = padL + (i / (xLabels.length - 1)) * innerW;
          return (
            <text key={"xl" + i} x={x} y={h - 10}
                  textAnchor="middle" fontSize="10.5" fill="var(--fg-mute)"
                  fontFamily="var(--font-mono)">{lab}</text>
          );
        })}

        {/* deploy markers behind series */}
        {deployMarkers.map((m, i) => {
          const mx = padL + m.at * innerW;
          return (
            <g key={"dm" + i}>
              <line x1={mx} y1={padT} x2={mx} y2={padT + innerH}
                    stroke={m.current ? "var(--brand)" : "var(--fg-mute)"}
                    strokeWidth="1"
                    strokeDasharray={m.current ? "" : "4 3"}
                    opacity={m.current ? 0.7 : 0.5}/>
              <rect x={mx - 36} y={padT + 4} width="72" height="16" rx="3"
                    fill={m.current ? "var(--brand)" : "var(--fg-mute)"} opacity={m.current ? 1 : 0.7}/>
              <text x={mx} y={padT + 15} textAnchor="middle"
                    fontSize="9.5" fontWeight="700" fill="white"
                    fontFamily="var(--font-mono)">{m.label}</text>
            </g>
          );
        })}

        {/* series */}
        {series.map((s) => (
          <g key={s.id}>
            {type === "area" && <path d={pathArea(s.data)} fill={s.color} opacity="0.14" />}
            {type === "bar" && s.data.map((v, i) => {
              const bw = innerW / N - 1;
              return <rect key={i} x={xx(i) - bw / 2} y={yy(v)} width={bw} height={yy(0) - yy(v)} fill={s.color} opacity="0.85" rx="1" />;
            })}
            {type !== "bar" && <path d={pathLine(s.data)} fill="none" stroke={s.color} strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />}
          </g>
        ))}

        {/* cursor */}
        {showCursor && (
          <g>
            <line x1={cursorX} y1={padT} x2={cursorX} y2={padT + innerH} stroke="var(--fg-0)" strokeOpacity="0.35" strokeDasharray="2 2" />
            {series.map((s) => (
              <circle key={"c" + s.id} cx={cursorX} cy={yy(s.data[cursorI])} r="3.5" fill="var(--bg-card)" stroke={s.color} strokeWidth="2" />
            ))}
          </g>
        )}
      </svg>

      {/* Floating readout */}
      {showCursor && (
        <div style={{
          position: "absolute",
          left: `${(cursorX / w) * 100}%`,
          top: 8,
          transform: cursorX > w * 0.7 ? "translateX(-100%) translateX(-8px)" : "translateX(8px)",
          background: "var(--bg-card)",
          border: "1px solid var(--line)",
          borderRadius: 6,
          boxShadow: "var(--shadow-md)",
          padding: "8px 10px",
          minWidth: 220,
          fontSize: 11.5,
          pointerEvents: "none",
        }}>
          <div className="mono" style={{ color: "var(--fg-3)", fontSize: 10.5, letterSpacing: "0.04em" }}>
            {timeAtCursor(hoverX)}
          </div>
          {series.map((s) => {
            const v = s.data[cursorI];
            const val = (yScale[0] + v * (yScale[1] - yScale[0]));
            return (
              <div key={s.id} className="row" style={{ justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                <div className="row" style={{ gap: 6 }}>
                  <span style={{ width: 8, height: 8, background: s.color, borderRadius: 2 }} />
                  <span style={{ color: "var(--fg-1)" }}>{s.label}</span>
                </div>
                <span className="mono" style={{ color: "var(--fg-0)", fontWeight: 600 }}>
                  {formatNum(val)}{yUnit && " "}{yUnit}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function timeAtCursor(frac) {
  // -4h to now
  const totalMin = 240;
  const m = Math.round((1 - frac) * totalMin);
  if (m === 0) return "now";
  if (m < 60) return `−${m}m`;
  return `−${Math.floor(m / 60)}h${m % 60 ? " " + (m % 60) + "m" : ""}`;
}
function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  if (n >= 100) return n.toFixed(0);
  return n.toFixed(1);
}

/* =========================================================
   HEATMAP (rows × columns), small density grid
   ========================================================= */
function Heatmap({ rows, cols = 24, seed = 7, palette }) {
  const cellW = 16, cellH = 14, gap = 2;
  const w = cols * (cellW + gap) - gap;
  const h = rows.length * (cellH + gap) - gap;
  const data = useMemoD(() => rows.map((_, r) => seededWave(seed + r, cols, 0.5, 0.35, 0.5)), [seed, rows.length, cols]);
  const pick = (v) => {
    const stops = palette || ["#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"];
    const idx = Math.min(stops.length - 1, Math.floor(v * stops.length));
    return stops[idx];
  };
  return (
    <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap, paddingTop: 1 }}>
        {rows.map((r, i) => (
          <div key={i} className="mono" style={{ fontSize: 10.5, color: "var(--fg-2)", height: cellH, lineHeight: cellH + "px", whiteSpace: "nowrap" }}>{r}</div>
        ))}
      </div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {data.map((row, r) => row.map((v, c) => (
          <rect key={`${r}-${c}`} x={c * (cellW + gap)} y={r * (cellH + gap)} width={cellW} height={cellH} fill={pick(v)} rx="1.5" />
        )))}
      </svg>
    </div>
  );
}

/* =========================================================
   QUERY ROW — colored chip-based metric editor
   ========================================================= */
function QueryRow({ id, color, soft, def, onRemove, isFormula }) {
  if (isFormula) {
    return (
      <div className="row" style={{ gap: 0, alignItems: "stretch", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "var(--bg-card)" }}>
        <div style={{ width: 36, background: soft, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-mono)" }}>{id}</div>
        <div className="row" style={{ padding: "8px 12px", gap: 10, flex: 1, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg-0)" }}>
          <span>formula</span>
          <input defaultValue={def.expr} className="mono" style={{ border: "1px solid var(--line-2)", borderRadius: 4, background: "var(--bg-inset)", padding: "4px 8px", fontSize: 12.5, minWidth: 240, outline: 0 }}/>
          <span className="muted" style={{ fontSize: 11.5 }}>· alias</span>
          <input defaultValue={def.alias} className="mono" style={{ border: "1px solid var(--line-2)", borderRadius: 4, background: "var(--bg-inset)", padding: "4px 8px", fontSize: 12.5, minWidth: 160, outline: 0 }}/>
        </div>
        <button className="btn btn-ghost btn-icon" style={{ width: 36, height: "auto", borderRadius: 0, borderLeft: "1px solid var(--line)" }} onClick={onRemove}><Icon name="x" size={14}/></button>
      </div>
    );
  }
  return (
    <div className="row" style={{ gap: 0, alignItems: "stretch", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "var(--bg-card)" }}>
      <div style={{ width: 36, background: soft, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, fontFamily: "var(--font-mono)" }}>{id}</div>
      <div className="row" style={{ padding: "8px 10px", gap: 8, flex: 1, flexWrap: "wrap" }}>
        <Chip kind="agg">{def.agg}</Chip>
        <Chip kind="metric"><span className="mono">{def.metric}</span></Chip>
        <span className="muted" style={{ fontSize: 11.5 }}>from</span>
        {def.from.map((t, i) => <Chip key={i} kind="filter"><span className="mono">{t}</span><Icon name="x" size={10}/></Chip>)}
        <Chip kind="add">+ filter</Chip>
        <span className="muted" style={{ fontSize: 11.5 }}>by</span>
        {def.by.map((t, i) => <Chip key={i} kind="by"><span className="mono">{t}</span><Icon name="x" size={10}/></Chip>)}
        <Chip kind="add">+ tag</Chip>
        <span className="muted" style={{ fontSize: 11.5 }}>as</span>
        <Chip kind="rollup">{def.rollup}</Chip>
        <span className="muted" style={{ fontSize: 11.5 }}>·</span>
        <Chip kind="rollup">{def.fn}</Chip>
      </div>
      <div className="row" style={{ borderLeft: "1px solid var(--line)" }}>
        <button className="btn btn-ghost btn-icon" style={{ width: 32, height: "auto", borderRadius: 0 }} title="Color"><span style={{ width: 12, height: 12, borderRadius: "50%", background: color, border: "2px solid var(--bg-card)", boxShadow: "0 0 0 1px " + color }}/></button>
        <button className="btn btn-ghost btn-icon" style={{ width: 32, height: "auto", borderRadius: 0 }} title="Duplicate"><Icon name="plus" size={14}/></button>
        <button className="btn btn-ghost btn-icon" style={{ width: 32, height: "auto", borderRadius: 0 }} onClick={onRemove}><Icon name="x" size={14}/></button>
      </div>
    </div>
  );
}

function Chip({ kind, children }) {
  const styles = {
    agg:    { background: "var(--bg-inset)", color: "var(--fg-0)", fontWeight: 600 },
    metric: { background: "var(--brand-tint)", color: "var(--brand-deep)", fontWeight: 500 },
    filter: { background: "var(--bg-inset)", color: "var(--fg-1)" },
    by:     { background: "color-mix(in oklab, var(--accent-violet) 10%, var(--bg-card))", color: "var(--accent-violet)" },
    rollup: { background: "var(--bg-inset)", color: "var(--fg-1)" },
    add:    { background: "transparent", color: "var(--fg-3)", border: "1px dashed var(--line)" },
  };
  return (
    <span className="row" style={{
      gap: 4,
      padding: "3px 8px",
      borderRadius: 4,
      fontSize: 12,
      whiteSpace: "nowrap",
      cursor: "pointer",
      ...styles[kind],
    }}>{children}</span>
  );
}

/* =========================================================
   METRICS EXPLORER SCREEN
   ========================================================= */
function MetricsScreen({ go }) {
  const [tab, setTab] = useStateD("explorer");
  const [chartType, setChartType] = useStateD("area");
  const [smoothing, setSmoothing] = useStateD(true);
  const [showLegend, setShowLegend] = useStateD(true);
  const [showMarkers, setShowMarkers] = useStateD(true);
  const [queries, setQueries] = useStateD([
    { id: "A", color: "var(--chart-1)", soft: "var(--brand-tint)",
      def: { agg: "avg", metric: "trace.http.request.duration{p95}", from: ["env:prod", "service:payment-svc"], by: ["region"], rollup: "by 60s", fn: "as_rate()" } },
    { id: "B", color: "var(--accent-violet)", soft: "var(--accent-violet-soft)",
      def: { agg: "avg", metric: "trace.http.request.duration{p99}", from: ["env:prod", "service:payment-svc"], by: ["region"], rollup: "by 60s", fn: "as_rate()" } },
    { id: "f1", isFormula: true,
      def: { expr: "B - A", alias: "p99 − p95 spread" } },
  ]);

  const removeQ = (id) => setQueries((q) => q.filter((x) => x.id !== id));

  // Build 3 series for the main chart
  const N = 90;
  const series = useMemoD(() => [
    { id: "us-east-1",  label: "us-east-1",  color: "var(--chart-1)",    data: seededWave(11, N, 0.45, 0.22, 0.5) },
    { id: "us-west-2",  label: "us-west-2",  color: "var(--accent-violet)", data: seededWave(17, N, 0.55, 0.20, 0.55) },
    { id: "eu-west-1",  label: "eu-west-1",  color: "var(--chart-3)",    data: seededWave(23, N, 0.40, 0.18, 0.65) },
    { id: "ap-south-1", label: "ap-south-1", color: "var(--orange)",     data: seededWave(31, N, 0.60, 0.24, 0.45) },
  ], []);

  const deploys = [
    { at: 0.34, label: "v8.11.7", current: false },
    { at: 0.78, label: "v8.12.0", current: true },
  ];

  return (
    <div className="page">
      {/* Page header */}
      <PageHeader
        icon="metrics"
        iconColor="var(--brand-deep)"
        iconBg="var(--brand-soft)"
        title="Metrics Explorer"
        subtitle="Query, slice and correlate — 12,847 metrics indexed across 412 hosts"
        actions={
          <div className="row" style={{ gap: 6 }}>
            <button className="btn"><Icon name="link-ext" size={13}/>Open in Notebook</button>
            <button className="btn"><Icon name="bell" size={13}/>Create monitor</button>
            <button className="btn"><Icon name="export" size={13}/>Export</button>
            <button className="btn btn-primary"><Icon name="plus" size={13}/>Save graph</button>
          </div>
        }
      />

      <Tabs
        tabs={[
          { id: "explorer", label: "Explorer" },
        ]}
        active={tab} setActive={setTab}
      />

      {/* QUERY BUILDER */}
      <div className="card card-pad-lg" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div className="card-title">Graph your data</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Compose one or more queries — use formulas to derive series</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-ghost" style={{ height: 28 }}><Icon name="zap" size={13}/>Suggested queries</button>
            <button className="btn" style={{ height: 28 }}><Icon name="link-ext" size={13}/>Share query</button>
          </div>
        </div>

        {queries.map((q) =>
          <QueryRow key={q.id} {...q} onRemove={() => removeQ(q.id)} />
        )}

        <div className="row" style={{ gap: 8, marginTop: 2 }}>
          <button className="btn"><Icon name="plus" size={13}/>Add query</button>
          <button className="btn"><Icon name="plus" size={13}/>Add formula</button>
          <div className="spacer"/>
          <span className="muted" style={{ fontSize: 11.5 }}>Estimated points · </span>
          <span className="mono" style={{ fontSize: 12, color: "var(--fg-0)" }}>5,400 × 4 series</span>
          <span className="muted" style={{ fontSize: 11.5 }}>·</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--ok)" }}>cached 184ms</span>
        </div>
      </div>

      {/* MAIN CHART + RIGHT PANEL */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 16 }}>
        {/* Main chart card */}
        <div className="card card-pad-lg">
          {/* View options */}
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
            <div className="row" style={{ gap: 14 }}>
              <div className="seg">
                {[
                  { id: "line", label: "Line" },
                  { id: "area", label: "Area" },
                  { id: "bar",  label: "Bars" },
                  { id: "stack",label: "Stack" },
                  { id: "heat", label: "Heat" },
                  { id: "top",  label: "Top-list" },
                ].map((o) => (
                  <div key={o.id}
                       className={"seg-opt" + (chartType === o.id ? " active" : "")}
                       onClick={() => setChartType(o.id)}>{o.label}</div>
                ))}
              </div>
              <Toggle label="Markers" v={showMarkers} onChange={setShowMarkers}/>
              <Toggle label="Legend"  v={showLegend} onChange={setShowLegend}/>
              <Toggle label="Smooth"  v={smoothing} onChange={setSmoothing}/>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <span className="muted" style={{ fontSize: 11.5 }}>Y-axis</span>
              <div className="seg">
                {["linear","log","%"].map((s) => (
                  <div key={s} className={"seg-opt" + (s === "linear" ? " active" : "")}>{s}</div>
                ))}
              </div>
              <button className="btn btn-ghost btn-icon" title="Fullscreen"><Icon name="more" size={14}/></button>
            </div>
          </div>

          {/* KPI strip above chart */}
          <div className="row" style={{ gap: 28, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { lab: "current",   val: "184",   un: "ms",  d: "+13.6%", dc: "down" },
              { lab: "1h avg",    val: "168",   un: "ms",  d: "+8.2%",  dc: "down" },
              { lab: "1h min",    val: "92",    un: "ms",  d: "−6.1%",  dc: "up" },
              { lab: "1h max",    val: "402",   un: "ms",  d: "+44%",   dc: "down warn" },
              { lab: "samples",   val: "184.2k",un: "pts", d: "live",   dc: "up" },
              { lab: "cardinality", val: "812", un: "series", d: "+4",  dc: "warn" },
            ].map((k) => (
              <div key={k.lab}>
                <div className="stat-label">{k.lab}</div>
                <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 2 }}>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>{k.val}</div>
                  <span className="stat-unit">{k.un}</span>
                  <span className={"delta " + k.dc} style={{ marginLeft: 4 }}>{k.d}</span>
                </div>
              </div>
            ))}
          </div>

          {/* The chart */}
          <BigChart
            series={series}
            height={360}
            type={chartType === "stack" ? "area" : chartType === "heat" || chartType === "top" ? "line" : chartType}
            yUnit="ms"
            yScale={[0, 400]}
            deployMarkers={showMarkers ? deploys : []}
          />

          {/* Legend */}
          {showLegend && (
            <div className="row" style={{ marginTop: 14, gap: 18, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--line-2)" }}>
              {series.map((s) => (
                <div key={s.id} className="row" style={{ gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: s.color, borderRadius: 2 }}/>
                  <span style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }} className="mono">{s.label}</span>
                  <span className="muted mono" style={{ fontSize: 11 }}>p95 · {(120 + s.data[s.data.length - 1] * 280).toFixed(0)}ms</span>
                </div>
              ))}
              <div className="spacer"/>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ width: 1, height: 12, background: "var(--brand)" }}/>
                <span className="muted mono" style={{ fontSize: 11 }}>v8.12.0 · 12m ago</span>
                <span style={{ width: 1, height: 12, background: "var(--fg-mute)", borderLeft: "1px dashed" }}/>
                <span className="muted mono" style={{ fontSize: 11 }}>v8.11.7 · 1h 18m ago</span>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — Top tags */}
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Top series</div>
              <div className="card-sub" style={{ marginTop: 2 }}>By current value · grouped by host</div>
            </div>
            <div className="seg">
              {["host","region","version"].map((s, i) => (
                <div key={s} className={"seg-opt" + (i === 0 ? " active" : "")}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { tag: "i-0a3b8e4d2", val: 402, deg: "+96ms", svc: "us-east-1a" },
              { tag: "i-0c92f1d27", val: 314, deg: "+44ms", svc: "us-east-1b" },
              { tag: "i-04a17bc8c", val: 268, deg: "+12ms", svc: "us-west-2a" },
              { tag: "i-0f1ad4e91", val: 244, deg: "−2ms",  svc: "us-east-1c" },
              { tag: "i-022d09a64", val: 198, deg: "+8ms",  svc: "eu-west-1a" },
              { tag: "i-09b76e3d8", val: 184, deg: "+3ms",  svc: "us-west-2b" },
              { tag: "i-0bc41f7ea", val: 142, deg: "−8ms",  svc: "ap-south-1a" },
              { tag: "i-08e3fa912", val: 118, deg: "−14ms", svc: "eu-west-1b" },
            ].map((r) => {
              const pct = Math.min(100, (r.val / 410) * 100);
              const hot = r.val > 300;
              return (
                <div key={r.tag} style={{ position: "relative", borderRadius: 5, overflow: "hidden", padding: "6px 8px" }}>
                  <div style={{ position: "absolute", inset: 0, background: hot ? "color-mix(in oklab, var(--err) 8%, transparent)" : "color-mix(in oklab, var(--brand) 6%, transparent)", width: pct + "%" }}/>
                  <div className="row" style={{ position: "relative", justifyContent: "space-between", gap: 8 }}>
                    <div className="row" style={{ gap: 8, minWidth: 0 }}>
                      <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)", overflow: "hidden", textOverflow: "ellipsis" }}>{r.tag}</span>
                      <span className="muted mono" style={{ fontSize: 10.5 }}>{r.svc}</span>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <span className={"delta " + (r.deg.startsWith("−") ? "up" : "down")} style={{ fontSize: 10.5 }}>{r.deg}</span>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: hot ? "var(--err)" : "var(--fg-0)" }}>{r.val}<span className="muted" style={{ fontWeight: 400 }}> ms</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hairline" style={{ margin: "12px 0" }}/>
          <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", height: 28 }}>
            <Icon name="chevron-down" size={13}/>Show 24 more
          </button>
        </div>
      </div>

      {/* HEATMAP + Recent metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 16 }}>
        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Distribution across fleet</div>
              <div className="card-sub" style={{ marginTop: 2 }}>p95 latency · binned every 10 min · color = density</div>
            </div>
            <div className="row" style={{ gap: 12 }}>
              <span className="muted" style={{ fontSize: 11 }}>0</span>
              <span style={{ width: 90, height: 8, borderRadius: 2, background: "linear-gradient(90deg,#dbeafe,#bfdbfe,#93c5fd,#60a5fa,#3b82f6,#1d4ed8)" }}/>
              <span className="muted" style={{ fontSize: 11 }}>40+ hosts</span>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <Heatmap
              cols={42}
              rows={["≥ 400ms","300–400","250–300","200–250","150–200","100–150","50–100","≤ 50ms"]}
            />
          </div>
          <div className="row" style={{ marginTop: 12, justifyContent: "space-between" }}>
            <div className="muted mono" style={{ fontSize: 10.5 }}>−4h ──────────────────────────────────── now</div>
            <div className="row" style={{ gap: 10 }}>
              <span className="badge info"><span className="b-dot"/>p95</span>
              <span className="muted" style={{ fontSize: 11 }}>92% of hosts under 200ms target</span>
            </div>
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="card-title">Recent metrics</div>
              <div className="card-sub" style={{ marginTop: 2 }}>You queried these in the last 24h</div>
            </div>
            <button className="btn btn-ghost" style={{ height: 26 }}>Browse all</button>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
            {[
              { m: "trace.http.request.duration",        type: "histogram", tags: 38, c: 1 },
              { m: "system.cpu.user",                     type: "gauge",     tags: 12, c: 3 },
              { m: "kafka.consumer.lag.max",              type: "gauge",     tags: 9,  c: 4 },
              { m: "aws.rds.cpuutilization",              type: "gauge",     tags: 6,  c: 2 },
              { m: "postgresql.queries.duration.95p",     type: "histogram", tags: 22, c: 5 },
              { m: "container.memory.usage.percent",      type: "gauge",     tags: 41, c: 6 },
              { m: "trace.http.request.errors",           type: "count",     tags: 19, c: 5 },
            ].map((r, i) => (
              <div key={r.m} className="row" style={{
                gap: 10,
                padding: "8px 4px",
                borderBottom: i < 6 ? "1px solid var(--line-2)" : "none",
                cursor: "pointer",
              }}>
                <MiniSpark seed={r.c * 7} color={`var(--chart-${r.c})`} width={64} height={20} amp={0.32}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12, color: "var(--fg-0)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.m}</div>
                  <div className="muted" style={{ fontSize: 10.5, marginTop: 1 }}>
                    <span className="mono">{r.type}</span> · {r.tags} tags
                  </div>
                </div>
                <Icon name="chevron-right" size={13} className="muted"/>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RELATED METRICS GRID */}
      <div>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div className="card-title">Correlated metrics</div>
            <div className="card-sub" style={{ marginTop: 2 }}>Other signals that moved with your query — last 4 hours</div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-ghost" style={{ height: 28 }}>Sort · correlation</button>
            <button className="btn btn-ghost" style={{ height: 28 }}>Show all 14</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { name: "container.cpu.user",         scope: "service:payment-svc", val: "62%",  delta: "+11.4%", deltaCls: "down warn", corr: 0.92, chart: 1, color: "var(--chart-1)", soft: "var(--chart-1-soft)" },
            { name: "container.memory.usage.pct", scope: "service:payment-svc", val: "78%",  delta: "+8.0%",  deltaCls: "down warn", corr: 0.87, chart: 2, color: "var(--accent-violet)", soft: "var(--accent-violet-soft)" },
            { name: "postgresql.connections",     scope: "db:payments-pg",      val: "184",  delta: "+44",    deltaCls: "down",      corr: 0.81, chart: 3, color: "var(--chart-3)", soft: "var(--ok-soft)" },
            { name: "kafka.consumer.lag.max",     scope: "topic:billing-evt",   val: "12.4k",delta: "+3.1k",  deltaCls: "down",      corr: 0.74, chart: 4, color: "var(--warn)", soft: "var(--warn-soft)" },
            { name: "trace.http.request.errors",  scope: "service:payment-svc", val: "0.42%",delta: "+0.18%", deltaCls: "down",      corr: 0.69, chart: 5, color: "var(--err)", soft: "var(--err-soft)" },
            { name: "aws.elb.target_response",    scope: "lb:payments-alb",     val: "212ms",delta: "+14ms",  deltaCls: "down",      corr: 0.61, chart: 6, color: "var(--orange)", soft: "color-mix(in oklab, var(--orange) 14%, transparent)" },
            { name: "redis.cmd.latency.99p",      scope: "cluster:cache-1",     val: "8.4ms",delta: "+1.2ms", deltaCls: "down warn", corr: 0.54, chart: 2, color: "var(--accent-violet-2)", soft: "var(--accent-violet-soft)" },
            { name: "system.net.bytes_out",       scope: "host:i-0a3b8e4d2",    val: "812MB",delta: "−4%",    deltaCls: "up",        corr: 0.42, chart: 1, color: "var(--brand-2)", soft: "var(--brand-tint)" },
          ].map((m, i) => (
            <div key={m.name} className="card" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 6 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-0)", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</div>
                  <div className="muted mono" style={{ fontSize: 10.5, marginTop: 2 }}>{m.scope}</div>
                </div>
                <span className="badge info" style={{ background: "var(--bg-inset)", color: "var(--fg-1)", whiteSpace: "nowrap" }}>r · {m.corr.toFixed(2)}</span>
              </div>
              <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 10 }}>
                <div className="stat-value" style={{ fontSize: 22 }}>{m.val}</div>
                <span className={"delta " + m.deltaCls}>{m.delta}</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <AreaSpark seed={m.chart * 13 + i} color={m.color} soft={m.soft} height={48} amp={0.28} base={0.5}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TAG VALUE TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="row" style={{ justifyContent: "space-between", padding: "14px 18px 12px" }}>
          <div>
            <div className="card-title">Group-by breakdown</div>
            <div className="card-sub" style={{ marginTop: 2 }}>trace.http.request.duration <span className="mono">{"{p95}"}</span> · grouped by <span className="mono">region, version</span></div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <div className="search" style={{ height: 28 }}>
              <Icon name="search" size={13} className="muted"/>
              <input placeholder="Filter rows"/>
            </div>
            <button className="btn btn-ghost" style={{ height: 28 }}><Icon name="export" size={13}/>CSV</button>
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Region</th>
              <th>Version</th>
              <th>Hosts</th>
              <th>min</th>
              <th>avg</th>
              <th>p95</th>
              <th>p99</th>
              <th>max</th>
              <th style={{ width: 180 }}>Last 1h</th>
              <th style={{ width: 90, textAlign: "right" }}>Δ</th>
            </tr>
          </thead>
          <tbody>
            {[
              { reg: "us-east-1", ver: "v8.12.0", hosts: 38, min: 88,  avg: 168, p95: 192, p99: 248, max: 402, d: "+22ms", dc: "down warn", spark: 7 },
              { reg: "us-east-1", ver: "v8.11.7", hosts: 12, min: 72,  avg: 124, p95: 142, p99: 168, max: 198, d: "−3ms",  dc: "up",        spark: 14 },
              { reg: "us-west-2", ver: "v8.12.0", hosts: 24, min: 94,  avg: 156, p95: 184, p99: 224, max: 312, d: "+11ms", dc: "down",      spark: 21 },
              { reg: "us-west-2", ver: "v8.11.7", hosts: 6,  min: 84,  avg: 128, p95: 148, p99: 172, max: 204, d: "−1ms",  dc: "up",        spark: 28 },
              { reg: "eu-west-1", ver: "v8.12.0", hosts: 18, min: 102, avg: 142, p95: 168, p99: 198, max: 264, d: "+8ms",  dc: "down",      spark: 35 },
              { reg: "eu-west-1", ver: "v8.11.7", hosts: 4,  min: 92,  avg: 118, p95: 138, p99: 158, max: 184, d: "−2ms",  dc: "up",        spark: 42 },
              { reg: "ap-south-1",ver: "v8.12.0", hosts: 14, min: 138, avg: 196, p95: 232, p99: 288, max: 348, d: "+18ms", dc: "down warn", spark: 49 },
              { reg: "ap-south-1",ver: "v8.11.7", hosts: 2,  min: 124, avg: 168, p95: 192, p99: 218, max: 244, d: "+1ms",  dc: "warn",      spark: 56 },
            ].map((r, i) => (
              <tr key={i}>
                <td><span className="mono" style={{ fontSize: 12, color: "var(--fg-0)" }}>{r.reg}</span></td>
                <td><span className="mono" style={{ fontSize: 12, color: "var(--fg-1)" }}>{r.ver}</span></td>
                <td className="mono" style={{ color: "var(--fg-2)" }}>{r.hosts}</td>
                <td className="mono">{r.min}</td>
                <td className="mono">{r.avg}</td>
                <td className="mono" style={{ color: "var(--fg-0)", fontWeight: 600 }}>{r.p95}</td>
                <td className="mono">{r.p99}</td>
                <td className="mono">{r.max}</td>
                <td><MiniSpark seed={r.spark} color="var(--chart-1)" width={170} height={26} amp={0.32}/></td>
                <td style={{ textAlign: "right" }}>
                  <span className={"delta " + r.dc}>{r.d}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toggle({ label, v, onChange }) {
  return (
    <div className="row" style={{ gap: 6, cursor: "pointer" }} onClick={() => onChange(!v)}>
      <div style={{
        width: 28, height: 16, borderRadius: 10,
        background: v ? "var(--brand)" : "var(--bg-inset)",
        border: "1px solid " + (v ? "var(--brand)" : "var(--line)"),
        position: "relative", transition: "background 120ms",
      }}>
        <div style={{
          position: "absolute", top: 1, left: v ? 13 : 1, width: 12, height: 12,
          background: "white", borderRadius: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
          transition: "left 120ms",
        }}/>
      </div>
      <span style={{ fontSize: 12, color: v ? "var(--fg-0)" : "var(--fg-2)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

Object.assign(window, { MetricsScreen, BigChart, Heatmap, QueryRow, Chip });
