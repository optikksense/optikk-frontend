import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { dynamicTo } from "@shared/utils/navigation";

import { ROUTES } from "@/shared/constants/routes";

import { getNodes } from "../../api/hostsApi";
import { InfraHostsFilterBar } from "../../components/InfraHostsFilterBar";
import { InfraHostsTable } from "../../components/InfraHostsTable";
import { InfraTopConsumersSidebar } from "../../components/InfraTopConsumersSidebar";
import type { InfrastructureNode } from "../../types";
import {
  EMPTY_NODE_FILTER,
  type NodeFilterState,
  filterNodes,
  serviceOptions,
} from "../../utils/filterNodes";

export default function HostsTab() {
  const navigate = useNavigate();
  const query = useTimeRangeQuery<readonly InfrastructureNode[]>(
    "infrastructure.hosts.list",
    (_team, s, e) => getNodes(s, e)
  );
  const [filter, setFilter] = useState<NodeFilterState>(EMPTY_NODE_FILTER);
  const nodes = query.data ?? [];
  const services = useMemo(() => serviceOptions(nodes), [nodes]);
  const filtered = useMemo(() => filterNodes(nodes, filter), [nodes, filter]);

  const onOpenNode = (host: string) => {
    navigate({ to: dynamicTo(ROUTES.hostDetail.replace("$host", encodeURIComponent(host))) });
  };

  return (
    <div className="flex flex-col gap-3">
      <InfraHostsFilterBar value={filter} serviceOptions={services} onChange={setFilter} />
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {filtered.length === 0 ? (
            <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
              {query.isPending ? "Loading hosts…" : "No hosts match the current filter."}
            </div>
          ) : (
            <InfraHostsTable nodes={filtered} onOpenNode={onOpenNode} />
          )}
        </div>
        <InfraTopConsumersSidebar onOpenHost={onOpenNode} />
      </div>
    </div>
  );
}
