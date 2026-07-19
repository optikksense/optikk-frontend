import { describe, expect, it } from "vitest";

import { slowQueryPatternSchema } from "./databaseSlowQueriesApi";

describe("slowQueryPatternSchema", () => {
  it("accepts responses from backends without query scope fields", () => {
    const row = slowQueryPatternSchema.parse({
      query_text: "SELECT * FROM orders WHERE id = ?",
      collection_name: "orders",
      p50_ms: 1,
      p95_ms: 2,
      p99_ms: 3,
      call_count: 10,
      error_count: 0,
    });

    expect(row).toMatchObject({
      query_hash: "",
      db_system: "",
      namespace: "",
      server: "",
    });
  });
});
