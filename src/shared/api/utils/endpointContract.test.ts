import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { afterEach, describe, expect, it } from "vitest";

import api from "@shared/api/http/client";
import { query, queryFacets, queryTrend, tracesService } from "@shared/api/traces/tracesApi";

import fixtures from "./__fixtures__.json";

/**
 * Exercises endpoints end to end — real client, interceptors, envelope
 * unwrapping, schema and transform — against fixtures marshalled from the Go
 * response structs. `contract.test.ts` covers the schemas in isolation; this
 * covers the normalization those schemas feed, which is where field drift
 * actually surfaced (a `hasError` rename reaching the browser).
 */
const f = fixtures as Record<string, unknown>;
const lowerCamelName = /^[a-z][A-Za-z0-9]*$/;
const realAdapter = api.raw.defaults.adapter;
let lastRequest: AxiosRequestConfig | undefined;

function collectInvalidKeys(value: unknown, path = "fixtures"): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectInvalidKeys(item, `${path}[${index}]`));
  }
  if (value === null || typeof value !== "object") return [];

  return Object.entries(value).flatMap(([key, child]) => {
    const childPath = `${path}.${key}`;
    const invalid = lowerCamelName.test(key) ? [] : [childPath];
    return [...invalid, ...collectInvalidKeys(child, childPath)];
  });
}

/** Serves a fixture as the next response instead of hitting the network. */
function serve(payload: unknown): void {
  api.raw.defaults.adapter = (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    lastRequest = config;
    return Promise.resolve({
      data: payload,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    } as AxiosResponse);
  };
}

afterEach(() => {
  api.raw.defaults.adapter = realAdapter;
  lastRequest = undefined;
});

const range = { startTime: 1, endTime: 2, filters: [], limit: 50 } as const;

describe("traces endpoints normalize the Go wire shape", () => {
  it("uses lower camelCase for every application-owned fixture key", () => {
    expect(collectInvalidKeys(fixtures)).toEqual([]);
  });

  it("query() maps results and lifts nextCursor out of pageInfo", async () => {
    serve(f.tracesQuery);
    const res = await query(range);

    expect(res.traces).toHaveLength(2);
    expect(res.nextCursor).toBe("c");
    expect(res.traces[0]).toMatchObject({
      traceId: "t1",
      rootService: "s",
      hasError: true,
      errorCount: 1,
      durationNs: 1_000_000,
    });
  });

  it("query() tolerates a null results array", async () => {
    serve({ results: null, pageInfo: { hasMore: false, limit: 50 } });
    const res = await query(range);

    expect(res.traces).toEqual([]);
    expect(res.nextCursor).toBeUndefined();
  });

  it("queryFacets() drops empty dimensions", async () => {
    serve(f.tracesFacets);
    const facets = await queryFacets(range);

    for (const buckets of Object.values(facets ?? {})) {
      expect(buckets.length).toBeGreaterThan(0);
    }
  });

  it("queryTrend() returns buckets carrying only what the wire has", async () => {
    serve(f.tracesTrend);
    const buckets = await queryTrend(range);

    expect(buckets.length).toBeGreaterThan(0);
    for (const b of buckets) {
      expect(typeof b.total).toBe("number");
      expect(typeof b.errors).toBe("number");
    }
  });

  it("getTraceSpans() unwraps the spans envelope", async () => {
    serve(f.traceSpansEnvelope);
    const spans = await tracesService.getTraceSpans(null, "t1");

    expect(Array.isArray(spans)).toBe(true);
    expect(spans.length).toBeGreaterThan(0);
    // A trace is addressed by id alone — no time window may be sent.
    expect(lastRequest?.params).toBeUndefined();
  });

  it("getServiceLatencyBaselines() keys p95/p99 by service", async () => {
    serve(f.redServices);
    const baselines = await tracesService.getServiceLatencyBaselines(1, 2);

    expect(baselines.size).toBeGreaterThan(0);
    for (const b of baselines.values()) {
      expect(typeof b.p95).toBe("number");
      expect(typeof b.p99).toBe("number");
    }
  });
});
