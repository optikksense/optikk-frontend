import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import uPlot from 'uplot';

import { useAppStore } from '@store/appStore';

interface ServiceDetailContextValue {
  serviceName: string;
  /** Shared uPlot sync instance for cursor synchronization across all charts */
  chartSync: uPlot.SyncPubSub;
  /** Handle time brush (drag-select on chart) → update global time range */
  onTimeBrush: (startMs: number, endMs: number) => void;
  /** Toggle previous period overlay */
  previousPeriodEnabled: boolean;
  setPreviousPeriodEnabled: (enabled: boolean) => void;
}

const ServiceDetailCtx = createContext<ServiceDetailContextValue | null>(null);

export function ServiceDetailProvider({
  serviceName,
  children,
}: {
  serviceName: string;
  children: React.ReactNode;
}) {
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const [previousPeriodEnabled, setPreviousPeriodEnabled] = useState(true);

  // Stable sync key instance — shared across all charts in this page
  const syncRef = useRef<uPlot.SyncPubSub>(uPlot.sync('service-detail'));
  const chartSync = syncRef.current;

  const onTimeBrush = useCallback(
    (startMs: number, endMs: number) => {
      setCustomTimeRange(Math.floor(startMs), Math.floor(endMs), 'Brushed range');
    },
    [setCustomTimeRange]
  );

  const value = useMemo<ServiceDetailContextValue>(
    () => ({
      serviceName,
      chartSync,
      onTimeBrush,
      previousPeriodEnabled,
      setPreviousPeriodEnabled,
    }),
    [serviceName, chartSync, onTimeBrush, previousPeriodEnabled]
  );

  return <ServiceDetailCtx.Provider value={value}>{children}</ServiceDetailCtx.Provider>;
}

export function useServiceDetailContext(): ServiceDetailContextValue {
  const ctx = useContext(ServiceDetailCtx);
  if (!ctx) throw new Error('useServiceDetailContext must be used within ServiceDetailProvider');
  return ctx;
}
