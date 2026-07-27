import { describe, expect, it } from "vitest";

import { ROUTES } from "@shared/constants/routes";

import { safeAuthRedirect } from "./redirect";

describe("safeAuthRedirect", () => {
  it("keeps an app-internal path", () => {
    expect(safeAuthRedirect("/logs?severity=error")).toBe("/logs?severity=error");
  });

  it.each([undefined, "", "https://example.com", "//example.com"])(
    "falls back to overview for %s",
    (candidate) => {
      expect(safeAuthRedirect(candidate)).toBe(ROUTES.overview);
    }
  );
});
