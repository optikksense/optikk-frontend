import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatDuration,
  formatNumber,
  formatPercentage,
  normalizePercentage,
} from "./formatters";

describe("formatters", () => {
  describe("formatNumber", () => {
    it("formats normal numbers correctly", () => {
      expect(formatNumber(100)).toBe("100");
      expect(formatNumber(1500)).toBe("1.5K");
      expect(formatNumber(387800)).toBe("387.8K");
      expect(formatNumber(1000000)).toBe("1M");
      expect(formatNumber(5547700)).toBe("5.5M");
    });

    it("handles zero and invalid inputs", () => {
      expect(formatNumber(0)).toBe("0");
      expect(formatNumber(null)).toBe("0");
      expect(formatNumber(undefined)).toBe("0");
      expect(formatNumber(Number.NaN)).toBe("0");
    });
  });

  describe("formatDuration", () => {
    it("formats milliseconds into human-readable duration", () => {
      expect(formatDuration(500)).toBe("500ms");
      expect(formatDuration(1500)).toBe("1.50s");
      expect(formatDuration(90000)).toBe("1.50m");
    });

    it("formats microseconds correctly", () => {
      expect(formatDuration(0.5)).toBe("500μs");
    });

    it("handles zero and invalid inputs", () => {
      expect(formatDuration(0)).toBe("0ms");
      expect(formatDuration(null)).toBe("0ms");
      expect(formatDuration(undefined)).toBe("0ms");
      expect(formatDuration(Number.NaN)).toBe("0ms");
    });
  });

  describe("formatBytes", () => {
    it("formats byte counts into appropriate units", () => {
      expect(formatBytes(0)).toBe("0B");
      expect(formatBytes(500)).toBe("500B");
      expect(formatBytes(1024)).toBe("1KB");
      expect(formatBytes(1536)).toBe("1.5KB");
      expect(formatBytes(1048576)).toBe("1MB");
    });
  });

  describe("normalizePercentage", () => {
    it("normalizes valid percentages", () => {
      expect(normalizePercentage(50)).toBe(50);
      expect(normalizePercentage("75")).toBe(75);
    });

    it("clamps values when clamp=true (default)", () => {
      expect(normalizePercentage(-10)).toBe(0);
      expect(normalizePercentage(150)).toBe(100);
    });

    it("does not clamp when clamp=false", () => {
      expect(normalizePercentage(-10, false)).toBe(-10);
      expect(normalizePercentage(150, false)).toBe(150);
    });

    it("handles zero and invalid inputs", () => {
      expect(normalizePercentage(0)).toBe(0);
      expect(normalizePercentage(null)).toBe(0);
      expect(normalizePercentage(undefined)).toBe(0);
      expect(normalizePercentage(Number.NaN)).toBe(0);
    });
  });

  describe("formatPercentage", () => {
    it("formats percentages to string with decimals", () => {
      expect(formatPercentage(50.123)).toBe("50.12%");
      expect(formatPercentage(50, 0)).toBe("50%");
    });

    it("clamps values by default", () => {
      expect(formatPercentage(150)).toBe("100.00%");
      expect(formatPercentage(-10)).toBe("0.00%");
    });
  });
});
