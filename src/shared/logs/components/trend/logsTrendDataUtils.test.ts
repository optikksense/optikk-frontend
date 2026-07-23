import { describe, expect, it } from "vitest";
import { parseBucketMs } from "./logsTrendDataUtils";

describe("LogsTrendChart Data Utilities", () => {
  describe("parseBucketMs", () => {
    it("parses typical postgres ISO timestamp", () => {
      const ms = parseBucketMs("2023-10-01 12:00:00", 0);
      expect(ms).toBe(Date.parse("2023-10-01T12:00:00Z"));
    });

    it("parses UTC timestamp", () => {
      const ms = parseBucketMs("2023-10-01T12:00:00Z", 0);
      expect(ms).toBe(Date.parse("2023-10-01T12:00:00Z"));
    });

    it("returns idx if invalid", () => {
      const ms = parseBucketMs("invalid", 5);
      expect(ms).toBe(5);
    });
  });
});
