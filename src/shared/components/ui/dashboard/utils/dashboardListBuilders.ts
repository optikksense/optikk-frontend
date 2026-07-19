import type { DashboardPanelSpec, DashboardRecord } from "@shared/types/dashboardConfig";

import { numValue, resolveComponentKey, strValue } from "./dashboardFormatters";

export type EndpointListType = "requests" | "errorRate" | "latency" | "count";

interface GroupedEndpointListRow {
  endpoint: string;
  service: string;
  key: string;
  requestCount: number;
  errorCount: number;
  errorRate: number;
  latency: number;
  value: number;
  [key: string]: string | number;
}

function isEndpointListType(value: string): value is EndpointListType {
  return value === "requests" || value === "errorRate" || value === "latency" || value === "count";
}

function buildEndpointKey(row: DashboardRecord) {
  const method = strValue(row, ["httpMethod"]).toUpperCase();
  const op = strValue(row, ["operationName", "endpointName"], "Unknown");
  const cleanOp = op.startsWith(`${method} `) ? op.substring(method.length + 1) : op;
  const serviceName = strValue(row, ["serviceName"]);
  return `${method} ${cleanOp}_${serviceName}`;
}

export function groupTimeseries(
  rows: DashboardRecord[],
  groupByKey: string
): Record<string, DashboardRecord[]> {
  const map: Record<string, DashboardRecord[]> = {};
  for (const row of rows) {
    const serviceName = strValue(row, ["serviceName"]);
    const queueName = strValue(row, ["queueName", "queue"], "unknown");
    const tableName = strValue(row, ["tableName", "table"], "unknown");
    const podName = strValue(row, ["pod", "podName"]);
    const exceptionType = strValue(row, ["exceptionType"], "unknown");
    let key;
    if (groupByKey === "queue") {
      key = `${queueName || "unknown"}::${serviceName || "unknown"}`;
    } else if (groupByKey === "table") {
      key = tableName;
    } else if (groupByKey === "service") {
      key = serviceName;
    } else if (groupByKey === "pod") {
      key = podName;
    } else if (groupByKey === "endpoint") {
      key = buildEndpointKey(row);
    } else if (groupByKey === "exceptionType") {
      key = exceptionType;
    } else {
      const directValue = strValue(row, [groupByKey], "");
      key = directValue || serviceName || queueName || "";
    }
    if (!key) continue;
    if (!map[key]) map[key] = [];
    map[key].push(row);
  }
  return map;
}

export function buildQueueEndpoints(
  topQueues: DashboardRecord[],
  sortField: string,
  scope: string
) {
  if (!Array.isArray(topQueues)) return [];
  const queueSeriesKey = (queue: DashboardRecord) =>
    `${strValue(queue, ["queueName"], "unknown")}::${strValue(queue, ["serviceName"], "unknown")}`;
  return [...topQueues]
    .sort((a, b) => Number(b[sortField] || 0) - Number(a[sortField] || 0))
    .map((queue) => ({
      ...queue,
      endpoint: strValue(queue, ["queueName"], "unknown"),
      seriesKey: queueSeriesKey(queue),
      key: `${scope}::${queueSeriesKey(queue)}`,
    }));
}

export function buildEndpointList(endpointMetrics: DashboardRecord[], listType: string) {
  if (!Array.isArray(endpointMetrics) || endpointMetrics.length === 0) return [];

  const mapped = endpointMetrics.map((endpoint) => {
    const method = strValue(endpoint, ["httpMethod"]).toUpperCase();
    const op = strValue(endpoint, ["operationName", "endpointName"], "Unknown");
    const cleanOp = op.startsWith(`${method} `) ? op.substring(method.length + 1) : op;
    const serviceName = strValue(endpoint, ["serviceName"]);
    const requestCount = numValue(endpoint, ["requestCount", "reqCount"]);
    const errorCount = numValue(endpoint, ["errorCount"]);
    const avgLatency = numValue(endpoint, ["avgLatency"]);
    return {
      ...endpoint,
      endpoint: `${method} ${cleanOp}`,
      serviceName: serviceName,
      service: serviceName,
      requestCount: requestCount,
      errorCount: errorCount,
      avgLatency: avgLatency,
      latency: avgLatency,
      key: `${method} ${cleanOp}_${serviceName || ""}`,
      errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0,
    };
  });

  if (listType === "errorRate") {
    return mapped
      .filter((endpoint) => endpoint.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
  }
  if (listType === "latency") {
    return mapped.sort((a, b) => (b.avgLatency || 0) - (a.avgLatency || 0)).slice(0, 10);
  }
  return mapped.sort((a, b) => (b.requestCount || 0) - (a.requestCount || 0)).slice(0, 10);
}

export function buildServiceListFromMetrics(serviceMetrics: DashboardRecord[], listType: string) {
  if (!Array.isArray(serviceMetrics) || serviceMetrics.length === 0) return [];

  const mapped = serviceMetrics
    .map((service) => {
      const name = strValue(service, ["serviceName", "service"], "");
      if (!name) return null;
      const requestCount = numValue(service, ["requestCount", "reqCount"]);
      const errorCount = numValue(service, ["errorCount"]);
      const avgLatency = numValue(service, ["avgLatency"]);
      const errorRate = requestCount > 0 ? (errorCount * 100.0) / requestCount : 0;
      return {
        ...service,
        serviceName: name,
        endpoint: name,
        service: name,
        key: name,
        requestCount: requestCount,
        errorCount: errorCount,
        errorRate,
        latency: avgLatency,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  if (listType === "errorRate") {
    return mapped
      .filter((service) => service.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
  }
  if (listType === "latency") {
    return mapped.sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return mapped.sort((a, b) => (b.requestCount || 0) - (a.requestCount || 0)).slice(0, 10);
}

export function defaultListTypeForChart(chartConfig: DashboardPanelSpec): EndpointListType {
  if (chartConfig.endpointListType && isEndpointListType(chartConfig.endpointListType)) {
    return chartConfig.endpointListType;
  }

  const componentKey = resolveComponentKey(chartConfig);
  if (componentKey === "error-rate") return "errorRate";
  if (componentKey === "latency") return "latency";
  if (componentKey === "exception-type-line") return "count";
  return "requests";
}

export function defaultListTitleForChart(chartConfig: DashboardPanelSpec) {
  if (chartConfig.listTitle) return chartConfig.listTitle;
  const listType = defaultListTypeForChart(chartConfig);
  if (listType === "errorRate") return "Average Error Rate";
  if (listType === "latency") return "Average Latency";
  if (listType === "count") return "Count";
  if (listType === "requests") return "Requests";
  return listType;
}

export function buildGroupedListFromTimeseries(
  serviceTimeseriesMap: Record<string, DashboardRecord[]>,
  chartConfig: DashboardPanelSpec
) {
  const listType = defaultListTypeForChart(chartConfig);
  const valueKey = chartConfig.valueKey || "requestCount";
  const groupByKey = String(chartConfig.groupByKey || "group");

  const rows = Object.entries(serviceTimeseriesMap || {})
    .map<GroupedEndpointListRow | null>(([groupName, groupRows]) => {
      if (!groupName || !Array.isArray(groupRows) || groupRows.length === 0) return null;

      let requestCount = 0;
      let errorCount = 0;
      let latencySum = 0;
      let latencyCount = 0;
      let valueTotal = 0;

      for (const row of groupRows) {
        const req = numValue(row, ["requestCount", "reqCount"]);
        const err = numValue(row, ["errorCount"]);
        if (!Number.isNaN(req)) requestCount += req;
        if (!Number.isNaN(err)) errorCount += err;

        const latencyVal = numValue(row, ["avgLatency", "avgDurationMs", valueKey], 0);
        if (!Number.isNaN(latencyVal) && latencyVal > 0) {
          latencySum += latencyVal;
          latencyCount += 1;
        }

        const value = numValue(row, [valueKey], 0);
        if (!Number.isNaN(value)) valueTotal += value;
      }

      const errorRate = requestCount > 0 ? (errorCount * 100.0) / requestCount : 0;
      const latency = latencyCount > 0 ? latencySum / latencyCount : 0;

      return {
        endpoint: groupName,
        service: chartConfig.groupByKey === "service" ? groupName : "",
        key: groupName,
        [groupByKey]: groupName,
        requestCount: valueTotal > 0 ? valueTotal : requestCount,
        errorCount: errorCount,
        errorRate,
        latency,
        value: valueTotal,
      };
    })
    .filter((row): row is GroupedEndpointListRow => row !== null);

  if (listType === "errorRate") {
    return rows
      .filter((row) => row.errorRate > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 10);
  }
  if (listType === "latency") {
    return rows.sort((a, b) => (b.latency || 0) - (a.latency || 0)).slice(0, 10);
  }
  return rows.sort((a, b) => (b.requestCount || 0) - (a.requestCount || 0)).slice(0, 10);
}
