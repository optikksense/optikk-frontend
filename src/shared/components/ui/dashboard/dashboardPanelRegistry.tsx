import { createContext, use, useMemo, useEffect } from 'react';

import type { ComponentType, PropsWithChildren } from 'react';

import type {
  DashboardPanelSpec,
  DashboardRecord,
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelType,
} from '@/types/dashboardConfig';

export interface BaseChartComponentProps {
  data?: DashboardRecord[];
  serviceTimeseriesMap: Record<string, DashboardRecord[]>;
  endpoints: DashboardRecord[];
  selectedEndpoints: string[];
  height?: number;
  fillHeight?: boolean;
  valueKey?: string;
  datasetLabel?: string;
  color?: string;
  targetThreshold?: number;
}

/** Props for specialized and self-contained dashboard panel renderers. */
export interface DashboardPanelRendererProps {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
  /** When true (default from shell), chart content should fill the grid tile (uPlot fillHeight, etc.). */
  fillHeight?: boolean;
}

export type SpecializedDashboardRenderer = ComponentType<DashboardPanelRendererProps>;
export type BaseChartDashboardRenderer = ComponentType<BaseChartComponentProps>;

export type DashboardPanelRendererKind = 'base-chart' | 'specialized' | 'self-contained';

type DashboardRendererComponent = SpecializedDashboardRenderer | BaseChartDashboardRenderer;

import type { TimeRange } from '@/types';
import { useTimeRange } from '@/app/store/appStore';

export interface DashboardPanelRegistration {
  readonly panelType: DashboardPanelType;
  readonly kind: DashboardPanelRendererKind;
  readonly component: DashboardRendererComponent;
  readonly onMount?: () => void;
  readonly onUnmount?: () => void;
  readonly onGlobalTimeChange?: (timeRange: TimeRange) => void;
  readonly onDataUpdate?: (data: unknown) => void;
}

export type DashboardPanelRegistry = ReadonlyMap<DashboardPanelType, DashboardPanelRegistration>;

function buildDashboardPanelRegistry(
  registrations: readonly DashboardPanelRegistration[]
): DashboardPanelRegistry {
  const entries = new Map<DashboardPanelType, DashboardPanelRegistration>();

  for (const registration of registrations) {
    if (!registration.panelType) {
      continue;
    }

    if (import.meta.env.DEV && entries.has(registration.panelType)) {
      console.warn(
        `Duplicate dashboard panel registration for ${registration.panelType}; latest registration wins.`
      );
    }

    entries.set(registration.panelType, registration);
  }

  return entries;
}

const DashboardPanelRegistryContext = createContext<DashboardPanelRegistry>(new Map());

interface DashboardPanelRegistryProviderProps extends PropsWithChildren {
  registrations: readonly DashboardPanelRegistration[];
}

export function DashboardPanelRegistryProvider({
  registrations,
  children,
}: DashboardPanelRegistryProviderProps) {
  const registry = useMemo(() => buildDashboardPanelRegistry(registrations), [registrations]);

  return (
    <DashboardPanelRegistryContext.Provider value={registry}>
      {children}
    </DashboardPanelRegistryContext.Provider>
  );
}

export function useDashboardPanelRegistration(
  panelType: DashboardPanelType | null | undefined
): DashboardPanelRegistration | null {
  const registry = use(DashboardPanelRegistryContext);
  if (!panelType) {
    return null;
  }
  return registry.get(panelType) ?? null;
}

export function useDashboardPanelLifecycle(
  registration: DashboardPanelRegistration | null,
  data?: unknown
) {
  const timeRange = useTimeRange();

  useEffect(() => {
    if (registration?.onMount) {
      registration.onMount();
    }
    return () => {
      if (registration?.onUnmount) {
        registration.onUnmount();
      }
    };
  }, [registration]);

  useEffect(() => {
    if (registration?.onGlobalTimeChange) {
      registration.onGlobalTimeChange(timeRange);
    }
  }, [registration, timeRange]);

  useEffect(() => {
    if (registration?.onDataUpdate && data !== undefined) {
      registration.onDataUpdate(data);
    }
  }, [registration, data]);
}
