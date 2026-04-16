import type { TrendPanelProps } from "./types";

export function TrendPanel({
  title,
  subtitle,
  headline,
  tone = "requests",
  children,
}: TrendPanelProps) {
  const toneClasses =
    tone === "errors"
      ? "border-[rgba(240,68,56,0.16)] bg-[linear-gradient(180deg,rgba(240,68,56,0.07),rgba(240,68,56,0.02))]"
      : tone === "latency"
        ? "border-[rgba(245,158,11,0.16)] bg-[linear-gradient(180deg,rgba(245,158,11,0.07),rgba(245,158,11,0.02))]"
        : "border-[rgba(94,96,206,0.16)] bg-[linear-gradient(180deg,rgba(94,96,206,0.07),rgba(94,96,206,0.02))]";

  return (
    <section
      className={`rounded-[calc(var(--card-radius)+2px)] border p-5 shadow-[var(--shadow-sm)] ${toneClasses}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">{title}</h3>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)] leading-5">{subtitle}</p>
        </div>
        <div className="rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.03)] px-3 py-1 font-semibold text-[12px] text-[var(--text-primary)] tracking-[0.02em]">
          {headline}
        </div>
      </div>
      <div className="mt-5 min-h-[280px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(15,18,25,0.35)] p-3">
        {children}
      </div>
    </section>
  );
}
