import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";

import DeploymentCompareDrawer from "@/features/overview/components/DeploymentCompareDrawer";
import ServiceDetailDrawer from "@/features/overview/components/ServiceDetailDrawer";
import { DetailDrawer } from "@shared/components/ui/layout";

import { clearDashboardDrawerSearch, readDashboardDrawerState } from "./utils/dashboardDrawerState";

const ENTITY_LABELS: Record<string, string> = {
  databaseSystem: "Database System",
  deployment: "Deployment",
  errorGroup: "Error Group",
  kafkaGroup: "Kafka Consumer Group",
  kafkaTopic: "Kafka Topic",
  node: "Node",
  redisInstance: "Redis Instance",
  service: "Service",
};

function toFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/\bDb\b/g, "DB")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bHttp\b/g, "HTTP")
    .replace(/\bP95\b/g, "P95")
    .replace(/\bP99\b/g, "P99")
    .replace(/\bRss\b/g, "RSS")
    .replace(/\bVms\b/g, "VMS");
}

export default function DashboardEntityDrawer(): JSX.Element | null {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const drawer = useMemo(() => readDashboardDrawerState(searchParams), [searchParams]);
  const isOpen = Boolean(drawer.entity && drawer.id);

  const drawerData = useMemo<Record<string, unknown>>(() => {
    if (!drawer.entity || !drawer.id) {
      return {};
    }

    return {
      entity: ENTITY_LABELS[drawer.entity] ?? drawer.entity,
      identifier: drawer.id,
      ...(drawer.data ?? {}),
    };
  }, [drawer.data, drawer.entity, drawer.id]);

  const sections = useMemo(() => {
    const primaryFields = [
      { label: "Entity", key: "entity" },
      { label: "Identifier", key: "identifier" },
    ];

    const extraFields = Object.keys(drawerData)
      .filter((key) => key !== "entity" && key !== "identifier")
      .sort((left, right) => left.localeCompare(right))
      .map((key) => ({
        label: toFieldLabel(key),
        key,
      }));

    return [
      { title: "Selection", fields: primaryFields },
      ...(extraFields.length > 0 ? [{ title: "Context", fields: extraFields }] : []),
    ];
  }, [drawerData]);

  if (!isOpen) {
    return null;
  }

  if (drawer.entity === "service") {
    return (
      <ServiceDetailDrawer
        open
        serviceName={drawer.id ?? ""}
        title={drawer.title}
        initialData={drawer.data}
        onClose={() =>
          navigate({
            to: (location.pathname + clearDashboardDrawerSearch(location.search)) as any,
            replace: true,
          })
        }
      />
    );
  }

  if (drawer.entity === "deployment") {
    return (
      <DeploymentCompareDrawer
        open
        title={drawer.title}
        initialData={drawer.data}
        onClose={() =>
          navigate({
            to: (location.pathname + clearDashboardDrawerSearch(location.search)) as any,
            replace: true,
          })
        }
      />
    );
  }

  return (
    <DetailDrawer
      open
      onClose={() =>
        navigate({
          to: (location.pathname + clearDashboardDrawerSearch(location.search)) as any,
          replace: true,
        })
      }
      title={
        drawer.title || (drawer.entity ? (ENTITY_LABELS[drawer.entity] ?? "Details") : "Details")
      }
      data={drawerData}
      sections={sections}
      extra={
        !drawer.data ? (
          <p className="text-[var(--text-secondary)] text-sm">
            This detail view was opened from a legacy link, so only the identifier is available
            until the parent dashboard is opened from a live row selection.
          </p>
        ) : null
      }
    />
  );
}
