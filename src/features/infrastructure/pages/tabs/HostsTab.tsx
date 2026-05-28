import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { dynamicTo } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import { getNodes } from "../../api/hostsApi";
import { InfraHostsTable } from "../../components/InfraHostsTable";
import type { InfrastructureNode } from "../../types";

function filterNodes(
  nodes: readonly InfrastructureNode[],
  search: string
): readonly InfrastructureNode[] {
  if (!search) return nodes;
  const needle = search.trim().toLowerCase();
  return nodes.filter((node) => {
    if (node.host.toLowerCase().includes(needle)) return true;
    return node.services.some((svc) => svc.toLowerCase().includes(needle));
  });
}

function HostSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-1.5">
      <Search size={14} className="text-[var(--text-muted)]" />
      <input
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
        placeholder="Filter hosts by name or service…"
        className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--text-primary)] outline-none"
      />
    </div>
  );
}

export default function HostsTab() {
  const navigate = useNavigate();
  const query = useTimeRangeQuery<readonly InfrastructureNode[]>(
    "infrastructure.hosts.list",
    (_team, s, e) => getNodes(s, e)
  );
  const [search, setSearch] = useState("");
  const nodes = query.data ?? [];
  const filtered = useMemo(() => filterNodes(nodes, search), [nodes, search]);

  const onOpenNode = (host: string) => {
    navigate({ to: dynamicTo(ROUTES.hostDetail.replace("$host", encodeURIComponent(host))) });
  };

  return (
    <div className="flex flex-col gap-3">
      <HostSearch value={search} onChange={setSearch} />
      {filtered.length === 0 ? (
        <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
          {query.isPending ? "Loading hosts…" : "No hosts match the current filter."}
        </div>
      ) : (
        <InfraHostsTable nodes={filtered} onOpenNode={onOpenNode} />
      )}
    </div>
  );
}
