export default function ServiceMap() {
  const nodes = [
    { id: 'api',   label: 'API Gateway',   cx: 220, cy: 90,  color: '#6366F1' },
    { id: 'auth',  label: 'Auth',          cx: 100, cy: 185, color: '#22D3EE' },
    { id: 'pay',   label: 'Payment',       cx: 340, cy: 185, color: '#10B981' },
    { id: 'db',    label: 'DB',            cx: 100, cy: 285, color: '#8B5CF6' },
    { id: 'cache', label: 'Cache',         cx: 220, cy: 285, color: '#F59E0B' },
    { id: 'notif', label: 'Notif',         cx: 340, cy: 285, color: '#EC4899' },
  ];
  const edges = [
    { from: 'api', to: 'auth', x1: 220, y1: 90, x2: 100, y2: 185 },
    { from: 'api', to: 'pay',  x1: 220, y1: 90, x2: 340, y2: 185 },
    { from: 'auth', to: 'db',  x1: 100, y1: 185, x2: 100, y2: 285 },
    { from: 'pay', to: 'cache',x1: 340, y1: 185, x2: 220, y2: 285 },
    { from: 'pay', to: 'notif',x1: 340, y1: 185, x2: 340, y2: 285 },
    { from: 'auth', to: 'cache',x1: 100,y1:185,  x2: 220, y2: 285 },
  ];

  return (
    <div style={{
      width: '100%',
      borderRadius: 14,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.10)',
      background: '#0D0E14',
      boxShadow: '0 32px 80px -20px rgba(0,0,0,0.7)',
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
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '3px 12px', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#475569' }}>
          app.optikk.io/services
        </div>
      </div>

      <svg
        viewBox="0 0 440 370"
        width="100%"
        style={{ display: 'block', background: '#0D0E14', padding: '8px 0' }}
      >
        <defs>
          {edges.map((e, i) => (
            <marker
              key={i}
              id={`arrow-${i}`}
              markerWidth="6" markerHeight="6"
              refX="5" refY="3" orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="rgba(255,255,255,0.15)" />
            </marker>
          ))}
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const len = Math.sqrt((e.x2-e.x1)**2 + (e.y2-e.y1)**2);
          return (
            <g key={i}>
              <line
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke="rgba(255,255,255,0.10)" strokeWidth={1.5}
                markerEnd={`url(#arrow-${i})`}
              />
              {/* animated dot */}
              <circle r={3} fill="#6366F1" opacity={0.8}>
                <animateMotion
                  dur={`${1.5 + i * 0.4}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.3}s`}
                >
                  <mpath href={`#epath-${i}`} />
                </animateMotion>
              </circle>
              <path id={`epath-${i}`} d={`M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`} fill="none" />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(n => (
          <g key={n.id}>
            <circle cx={n.cx} cy={n.cy} r={32}
              fill={`${n.color}18`} stroke={n.color} strokeWidth={1.5}
            />
            <circle cx={n.cx} cy={n.cy} r={4} fill={n.color} opacity={0.9} />
            <text x={n.cx} y={n.cy + 46}
              textAnchor="middle"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fill: '#94A3B8' }}
            >{n.label}</text>
            {/* health dot */}
            <circle cx={n.cx + 22} cy={n.cy - 22} r={5}
              fill={n.id === 'notif' ? '#EF4444' : '#10B981'}
              stroke="#0D0E14" strokeWidth={1.5}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
