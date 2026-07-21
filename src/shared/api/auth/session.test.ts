import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@app/store/authStore";

import type { SessionPayload } from "./authApi";

// Mock the pure HTTP layer so we drive refresh outcomes directly. `isAuthRejection`
// is the contract boundary the session relies on to tell a real 401 apart from a
// transient failure, so it is mocked alongside `authApi`.
vi.mock("./authApi", () => ({
  authApi: { login: vi.fn(), refresh: vi.fn() },
  isAuthRejection: vi.fn(),
}));

// Side-effect collaborators of session teardown — mocked so the test stays
// focused on the refresh outcome and free of the persisted store's localStorage.
vi.mock("@app/store/appStore", () => ({
  useAppStore: { getState: () => ({ setSelectedTenantId: vi.fn() }) },
}));
vi.mock("@shared/api/queryClient", () => ({
  queryClient: { clear: vi.fn() },
}));

import { authApi, isAuthRejection } from "./authApi";
import { session } from "./session";

const authApiMock = vi.mocked(authApi);
const isAuthRejectionMock = vi.mocked(isAuthRejection);

// An unparseable token skips proactive-refresh scheduling, keeping the test free
// of background timers.
const payload: SessionPayload = {
  user: { id: 1, email: "user@optikk.in", name: "User" },
  tenant: { id: 7, name: "Acme", role: "owner", accountStatus: "active", trialEndsAt: null },
  accessToken: "opaque-access-token",
};

beforeEach(async () => {
  vi.clearAllMocks();
  authApiMock.login.mockResolvedValue(payload);
  await session.login("user@optikk.in", "pw");
});

afterEach(async () => {
  isAuthRejectionMock.mockReturnValue(true);
  authApiMock.refresh.mockRejectedValue(new Error("teardown"));
  await session.refreshAccessToken();
});

describe("session refresh resilience", () => {
  it("keeps the session on a transient refresh failure", async () => {
    isAuthRejectionMock.mockReturnValue(false);
    authApiMock.refresh.mockRejectedValue(new Error("network down"));

    const token = await session.refreshAccessToken();

    expect(token).toBeNull();
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(session.getAccessToken()).toBe("opaque-access-token");
  });

  it("ends the session on a definitive 401", async () => {
    isAuthRejectionMock.mockReturnValue(true);
    authApiMock.refresh.mockRejectedValue(new Error("unauthorized"));

    const token = await session.refreshAccessToken();

    expect(token).toBeNull();
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(session.getAccessToken()).toBeNull();
  });

  it("returns the refreshed token on success", async () => {
    authApiMock.refresh.mockResolvedValue({ ...payload, accessToken: "renewed-token" });

    const token = await session.refreshAccessToken();

    expect(token).toBe("renewed-token");
    expect(useAuthStore.getState().status).toBe("authenticated");
  });
});
