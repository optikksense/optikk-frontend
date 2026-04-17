export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sdd-section">
      <div className="sdd-section__title">{title}</div>
      {children}
    </div>
  );
}

export function KVRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="sdd-kv">
      <span className="sdd-kv__label">{label}</span>
      <span className={`sdd-kv__value ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
