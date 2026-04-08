import { CHART_COLORS } from "@config/constants";

interface Props {
  spans: Array<{ service_name?: string }>;
  activeService: string | null;
  onSelect: (service: string | null) => void;
}

function serviceColor(name: string): string {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CHART_COLORS[hash % CHART_COLORS.length];
}

export default function ServicePills({ spans, activeService, onSelect }: Props) {
  const counts: Record<string, number> = {};
  spans.forEach((s) => {
    const svc = s.service_name || "unknown";
    counts[svc] = (counts[svc] || 0) + 1;
  });
  const services = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (services.length === 0) return null;

  const pillBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid transparent",
    transition: "opacity 0.15s, border-color 0.15s",
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      <span
        style={{
          ...pillBase,
          background: activeService === null ? "var(--glass-border)" : "var(--glass-bg)",
          border: "1px solid var(--glass-border)",
          color: "var(--text-primary)",
        }}
        onClick={() => onSelect(null)}
      >
        All
      </span>
      {services.map(([svc, count]) => {
        const color = serviceColor(svc);
        const isActive = activeService === svc;
        return (
          <span
            key={svc}
            style={{
              ...pillBase,
              background: isActive ? `${color}22` : "var(--glass-bg)",
              borderColor: isActive ? color : "var(--glass-border)",
              color: isActive ? color : "var(--text-secondary)",
            }}
            onClick={() => onSelect(isActive ? null : svc)}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            {svc}
            <span style={{ opacity: 0.6, fontSize: 11 }}>({count})</span>
          </span>
        );
      })}
    </div>
  );
}
