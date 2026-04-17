import { useMemo } from "react";

import type { DeploymentSeed } from "../types";
import { buildTimelineSeries, parseDeploymentSeed } from "../utils";

import { useDeploymentCompareQuery } from "./useDeploymentCompareQuery";
import { useVersionTrafficQuery } from "./useVersionTrafficQuery";

export function useDeploymentCompare(initialData: Record<string, unknown> | null | undefined) {
  const seed: DeploymentSeed | null = useMemo(
    () => parseDeploymentSeed(initialData),
    [initialData]
  );
  const compareQuery = useDeploymentCompareQuery(seed);
  const compare = compareQuery.data;
  const timelineQuery = useVersionTrafficQuery(compare);
  const timeline = useMemo(
    () => (compare && timelineQuery.data ? buildTimelineSeries(compare, timelineQuery.data) : null),
    [compare, timelineQuery.data]
  );

  return { seed, compare, compareQuery, timelineQuery, timeline };
}
