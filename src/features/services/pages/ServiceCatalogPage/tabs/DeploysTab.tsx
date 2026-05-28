import { DeploysList } from "../deploys/DeploysList";

export function DeploysTab() {
  return (
    <section className="rounded-md border border-[var(--border-color)] bg-[var(--bg-card)]">
      <header className="flex items-baseline justify-between border-[var(--border-color)] border-b px-4 py-3">
        <div>
          <div className="font-medium text-[13px] text-[var(--text-primary)]">Recent deploys</div>
          <div className="text-[11px] text-[var(--text-muted)]">Latest version per service</div>
        </div>
      </header>
      <DeploysList />
    </section>
  );
}
