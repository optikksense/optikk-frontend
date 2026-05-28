import { usePolicies } from "../../hooks/useNotifications";

export default function PoliciesTab() {
  const q = usePolicies();
  const policies = q.data ?? [];
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
        <div>
          <div className="text-sm font-medium">Routing policies</div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Rules evaluated top-down · first match wins · matcher engine ships in a follow-up.
          </div>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--border-color)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
          <tr>
            <th className="py-2 pl-4 text-left font-medium">Policy</th>
            <th className="py-2 text-left font-medium">Match</th>
            <th className="py-2 text-right font-medium">Hits 30d</th>
            <th className="py-2 pr-4 text-left font-medium">Enabled</th>
          </tr>
        </thead>
        <tbody>
          {q.isPending && !q.data ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-xs text-[var(--text-muted)]">
                Loading…
              </td>
            </tr>
          ) : policies.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-6 text-center text-xs text-[var(--text-muted)]">
                No policies yet.
              </td>
            </tr>
          ) : (
            policies.map((p, i) => (
              <tr key={p.id} className="border-b border-[var(--border-color)] last:border-0">
                <td className="py-2 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="py-2 font-mono text-[11px] text-[var(--text-secondary)]">
                  {p.match_dsl}
                </td>
                <td className="py-2 text-right font-mono">{p.hits_30d}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      p.enabled
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {p.enabled ? "on" : "off"}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
