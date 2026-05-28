import { useStandardQuery } from "@/shared/hooks/useStandardQuery";

import {
  type Monitor,
  type MonitorEvent,
  type MonitorSeriesResponse,
  type StatusTimelineResponse,
  getMonitor,
  getMonitorEvents,
  getMonitorSeries,
  getMonitorStatusTimeline,
} from "../api/monitorsApi";

export function useMonitorDetail(id: number | undefined) {
  return useStandardQuery<Monitor>({
    queryKey: ["monitors", "detail", id],
    queryFn: () => getMonitor(id!),
    enabled: id !== undefined,
  });
}

export function useMonitorSeriesQuery(id: number | undefined, windowMs: number) {
  return useStandardQuery<MonitorSeriesResponse>({
    queryKey: ["monitors", "series", id, windowMs],
    queryFn: () => getMonitorSeries(id!, windowMs),
    enabled: id !== undefined,
  });
}

export function useMonitorEventsQuery(id: number | undefined, limit = 10) {
  return useStandardQuery<MonitorEvent[]>({
    queryKey: ["monitors", "events", id, limit],
    queryFn: () => getMonitorEvents(id!, limit),
    enabled: id !== undefined,
  });
}

export function useStatusTimelineQuery(id: number | undefined, windowMs: number) {
  return useStandardQuery<StatusTimelineResponse>({
    queryKey: ["monitors", "status-timeline", id, windowMs],
    queryFn: () => getMonitorStatusTimeline(id!, windowMs),
    enabled: id !== undefined,
  });
}
