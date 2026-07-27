import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  getCloudCategories,
  getCloudHealth,
  getCloudInventory,
  getCloudRestarts,
  getProviderAccounts,
  getProviderPlatforms,
  getProviderResources,
} from "../api/cloudApi";
import type { CloudOverview, CloudProviderDetail, ProviderSummary } from "../types";

export function useCloudOverview() {
  const inventoryQ = useTimeRangeQuery("cloud.inventory", (_tenantId, start, end) =>
    getCloudInventory(start, end)
  );
  const categoriesQ = useTimeRangeQuery("cloud.categories", (_tenantId, start, end) =>
    getCloudCategories(start, end)
  );
  const healthQ = useTimeRangeQuery("cloud.health", (_tenantId, start, end) =>
    getCloudHealth(start, end)
  );
  const restartsQ = useTimeRangeQuery("cloud.restarts", (_tenantId, start, end) =>
    getCloudRestarts(start, end)
  );

  const isPending =
    inventoryQ.isPending || categoriesQ.isPending || healthQ.isPending || restartsQ.isPending;
  const isError = inventoryQ.isError || categoriesQ.isError || healthQ.isError || restartsQ.isError;
  const error = inventoryQ.error || categoriesQ.error || healthQ.error || restartsQ.error;

  const inventory = inventoryQ.data;
  const categories = categoriesQ.data;
  const health = healthQ.data;
  const restarts = restartsQ.data;

  let data: CloudOverview | undefined;
  if (
    inventory !== undefined &&
    categories !== undefined &&
    health !== undefined &&
    restarts !== undefined
  ) {
    const safeInventory = Array.isArray(inventory) ? inventory : [];
    const safeCategories = categories ?? {};
    const safeHealth = health ?? {};
    const safeRestarts = restarts ?? {};

    const providers: ProviderSummary[] = safeInventory.map((inv) => ({
      provider: inv.provider,
      accounts: Number(inv.accounts),
      regions: Number(inv.regions),
      nodes: Number(inv.nodes),
      pods: Number(inv.pods),
      resources: Number(inv.resources),
      restarts: Number(safeRestarts[inv.provider] ?? 0),
      categories: safeCategories[inv.provider] ?? [],
      health: safeHealth[inv.provider] ?? { healthy: 0, degraded: 0, unhealthy: 0 },
      lastSeen: inv.lastSeen,
    }));

    let totalResources = 0;
    let totalAccounts = 0;
    let totalRegions = 0;
    let totalNodes = 0;
    let totalPods = 0;
    let unhealthy = 0;
    let degraded = 0;

    for (const p of providers) {
      totalResources += p.resources;
      totalAccounts += p.accounts;
      totalRegions += p.regions;
      totalNodes += p.nodes;
      totalPods += p.pods;
      unhealthy += p.health.unhealthy;
      degraded += p.health.degraded;
    }

    data = {
      providers,
      totalResources,
      totalAccounts,
      totalRegions,
      totalNodes,
      totalPods,
      unhealthy,
      degraded,
    };
  }

  return { isPending, isError, error, data };
}

export function useCloudProvider(provider: string | null) {
  const enabled = Boolean(provider);
  const platformsQ = useTimeRangeQuery(
    "cloud.provider.platforms",
    (_tenantId, start, end) => getProviderPlatforms(provider ?? "", start, end),
    { extraKeys: [provider ?? ""], enabled }
  );
  const accountsQ = useTimeRangeQuery(
    "cloud.provider.accounts",
    (_tenantId, start, end) => getProviderAccounts(provider ?? "", start, end),
    { extraKeys: [provider ?? ""], enabled }
  );
  const resourcesQ = useTimeRangeQuery(
    "cloud.provider.resources",
    (_tenantId, start, end) => getProviderResources(provider ?? "", start, end),
    { extraKeys: [provider ?? ""], enabled }
  );

  const isPending = platformsQ.isPending || accountsQ.isPending || resourcesQ.isPending;
  const isError = platformsQ.isError || accountsQ.isError || resourcesQ.isError;
  const error = platformsQ.error || accountsQ.error || resourcesQ.error;

  let data: CloudProviderDetail | undefined;
  if (
    provider &&
    platformsQ.data !== undefined &&
    accountsQ.data !== undefined &&
    resourcesQ.data !== undefined
  ) {
    data = {
      provider,
      services: Array.isArray(platformsQ.data) ? platformsQ.data : [],
      accounts: Array.isArray(accountsQ.data) ? accountsQ.data : [],
      resources: Array.isArray(resourcesQ.data) ? resourcesQ.data : [],
    };
  }

  return { isPending, isError, error, data };
}
