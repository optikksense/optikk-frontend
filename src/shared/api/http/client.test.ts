import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { afterEach, describe, expect, it } from "vitest";

import api from "./client";

/**
 * The envelope has exactly one layer. A second {data:…} nested under data went
 * unpeeled and silently zeroed the Overview request-rate chart, so what is
 * pinned here is the number of layers, not the payload.
 */
const realAdapter = api.raw.defaults.adapter;

function serve(payload: unknown): void {
  api.raw.defaults.adapter = (config: AxiosRequestConfig): Promise<AxiosResponse> =>
    Promise.resolve({
      data: payload,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    } as AxiosResponse);
}

afterEach(() => {
  api.raw.defaults.adapter = realAdapter;
});

describe("response envelope", () => {
  it("peels exactly one layer, leaving the payload", async () => {
    serve({
      success: true,
      data: [{ timestamp: "2026-07-19T17:30:00Z", requestCount: 370_000 }],
    });

    const rows = await api.get<Array<{ requestCount: number }>>(
      "/spans/red/request-and-error-rate"
    );

    expect(Array.isArray(rows)).toBe(true);
    expect(rows[0].requestCount).toBe(370_000);
  });

  it("exposes the comparison sibling without nesting it under data", async () => {
    serve({ success: true, data: { p99Ms: 120 }, comparison: { p99Ms: 90 } });

    const page = await api.getComparable<{ p99Ms: number }>("/spans/red/summary");

    expect(page.data.p99Ms).toBe(120);
    expect(page.comparison?.p99Ms).toBe(90);
  });

  it("reports no comparison when the response omits it", async () => {
    serve({ success: true, data: { p99Ms: 120 } });

    const page = await api.getComparable<{ p99Ms: number }>("/spans/red/summary");

    expect(page.comparison).toBeUndefined();
  });
});
