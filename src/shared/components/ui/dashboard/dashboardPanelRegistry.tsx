import {
  createContext,
  useContext,
  useMemo,
} from 'react';

import type { ComponentType, PropsWithChildren } from 'react';

import type {
  DashboardComponentSpec,
  DashboardRecord,
  DashboardDataSources,
  DashboardExtraContext,
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

export interface DashboardPanelRendererProps {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}

export type SpecializedDashboardRenderer = ComponentType<DashboardPanelRendererProps>;
export type BaseChartDashboardRenderer = ComponentType<BaseChartComponentProps>;

export type DashboardPanelRendererKind =
  | 'base-chart'
  | 'specialized'
  | 'self-contained';

type DashboardRendererComponent =
  | SpecializedDashboardRenderer
  | BaseChartDashboardRenderer;

export interface DashboardPanelRegistration {
  readonly panelType: string;
  readonly kind: DashboardPanelRendererKind;
  readonly component: DashboardRendererComponent;
}

export type DashboardPanelRegistry = ReadonlyMap<string, DashboardPanelRegistration>;

function buildDashboardPanelRegistry(
  registrations: readonly DashboardPanelRegistration[],
): DashboardPanelRegistry {
  const entries = new Map<string, DashboardPanelRegistration>();

  for (const registration of registrations) {
    if (!registration.panelType) {
      continue;
    }

    if (import.meta.env.DEV && entries.has(registration.panelType)) {
      console.warn(
        `Duplicate dashboard panel registration for ${registration.panelType}; latest registration wins.`,
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
  const registry = useMemo(
    () => buildDashboardPanelRegistry(registrations),
    [registrations],
  );

  return (
    <DashboardPanelRegistryContext.Provider value={registry}>
      {children}
    </DashboardPanelRegistryContext.Provider>
  );
}

export function useDashboardPanelRegistration(
  panelType: string | null | undefined,
): DashboardPanelRegistration | null {
  const registry = useContext(DashboardPanelRegistryContext);
  if (!panelType) {
    return null;
  }
  return registry.get(panelType) ?? null;
}
