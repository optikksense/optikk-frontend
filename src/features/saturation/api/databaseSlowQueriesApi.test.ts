import { describe, expect, it } from "vitest";

import { slowQueryPatternSchema } from "./databaseSlowQueriesApi";

describe("slowQueryPatternSchema", () => {
  it("accepts responses from backends without query scope fields", () => {
    const row = slowQueryPatternSchema.parse({
      queryText: "SELECT * FROM orders WHERE id = ?",
      collectionName: "orders",
      p50Ms: 1,
      p95Ms: 2,
      p99Ms: 3,
      callCount: 10,
      errorCount: 0,
    });

    expect(row).toMatchObject({
      queryHash: "",
      dbSystem: "",
      namespace: "",
      server: "",
    });
  });
});
