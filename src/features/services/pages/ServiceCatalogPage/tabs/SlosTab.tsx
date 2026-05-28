import { SlosTable } from "../slos/SlosTable";

export function SlosTab() {
  return (
    <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)]">
      <header className="flex items-baseline justify-between border-[var(--border-color)] border-b px-4 py-3">
        <div>
          <div className="font-medium text-[13px] text-[var(--text-primary)]">SLOs</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Sorted by remaining error budget
          </div>
        </div>
      </header>
      <div className="p-2">
        <SlosTable />
      </div>
    </section>
  );
}
