import { Card } from "@shared/components/primitives/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatNumber } from "@shared/utils/formatters";

import { infraGet } from "../../api/infrastructureApi";
import type { K8sPodRestartRow, ReplicaStat } from "../../types";

export function PodRestartsTable() {
  const q = useTimeRangeQuery<K8sPodRestartRow[]>(
    "infra-k8s-restarts-table",
    async (teamId, start, end) => {
      if (!teamId) return [];
      const data = await infraGet<K8sPodRestartRow[]>(
        "/v1/infrastructure/kubernetes/pod-restarts",
        teamId,
        Number(start),
        Number(end)
      );
      return Array.isArray(data) ? data : [];
    }
  );

  return (
    <Card padding="md" className="border-[var(--border-color)]">
      <div className="mb-3 font-medium text-[13px] text-[var(--text-primary)]">
        Pod restarts (top)
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-[var(--border-color)] border-b text-[var(--text-muted)]">
              <th className="py-2 pr-4">Namespace</th>
              <th className="py-2 pr-4">Pod</th>
              <th className="py-2">Restarts</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((r) => (
              <tr
                key={`${r.namespace}/${r.pod_name}`}
                className="border-[var(--border-color)] border-b"
              >
                <td className="py-2 pr-4 font-mono text-[var(--text-secondary)]">{r.namespace}</td>
                <td className="py-2 pr-4 font-mono text-[var(--text-primary)]">{r.pod_name}</td>
                <td className="py-2">{formatNumber(r.restarts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.length === 0 ? (
          <div className="py-6 text-center text-[var(--text-muted)]">No restart data</div>
        ) : null}
      </div>
    </Card>
  );
}

export function ReplicaSetsTable() {
  const q = useTimeRangeQuery<ReplicaStat[]>("infra-k8s-replica", async (teamId, start, end) => {
    if (!teamId) return [];
    const data = await infraGet<ReplicaStat[]>(
      "/v1/infrastructure/kubernetes/replica-status",
      teamId,
      Number(start),
      Number(end)
    );
    return Array.isArray(data) ? data : [];
  });

  return (
    <Card padding="md" className="border-[var(--border-color)]">
      <div className="mb-3 font-medium text-[13px] text-[var(--text-primary)]">Replica sets</div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-[var(--border-color)] border-b text-[var(--text-muted)]">
              <th className="py-2 pr-4">Replica set</th>
              <th className="py-2 pr-4">Desired</th>
              <th className="py-2">Available</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((r) => (
              <tr key={r.replica_set} className="border-[var(--border-color)] border-b">
                <td className="py-2 pr-4 font-mono text-[var(--text-primary)]">{r.replica_set}</td>
                <td className="py-2 pr-4">{formatNumber(r.desired)}</td>
                <td className="py-2">{formatNumber(r.available)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {q.data?.length === 0 ? (
          <div className="py-6 text-center text-[var(--text-muted)]">No replica data</div>
        ) : null}
      </div>
    </Card>
  );
}
