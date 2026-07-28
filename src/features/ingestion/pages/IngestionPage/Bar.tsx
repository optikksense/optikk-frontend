                                                                        
export function Bar({ pct, color, label }: { pct: number; color: string; label?: string }) {
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-secondary"
      role="img"
      aria-label={label ?? `${Math.round(pct)}%`}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  );
}
