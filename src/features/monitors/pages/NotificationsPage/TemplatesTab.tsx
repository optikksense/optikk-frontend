import { useTemplates } from "../../hooks/useNotifications";

export default function TemplatesTab() {
  const q = useTemplates();
  const templates = q.data ?? [];
  return (
    <div className="grid grid-cols-2 gap-3">
      {q.isPending && !q.data ? (
        <div className="col-span-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-center text-xs text-[var(--text-muted)]">
          Loading templates…
        </div>
      ) : templates.length === 0 ? (
        <div className="col-span-2 rounded-lg border border-dashed border-[var(--border-color)] p-8 text-center text-sm text-[var(--text-muted)]">
          No templates yet. Templates let you customize Slack message body — coming soon.
        </div>
      ) : (
        templates.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-4"
          >
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-medium">{t.name}</div>
              <span className="font-mono text-[10px] text-[var(--text-muted)]">
                {t.used_count} in use
              </span>
            </div>
            {t.description && (
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t.description}</div>
            )}
            <div className="mt-3 rounded bg-[var(--bg-secondary)] p-3">
              <div className="whitespace-pre-line font-mono text-[11px] text-[var(--text-secondary)]">
                {t.body}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
