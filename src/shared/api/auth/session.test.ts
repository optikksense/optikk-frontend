import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthStore } from "@app/store/authStore";

import { AuthError, type SessionPayload } from "./authApi";

// Mock the pure HTTP layer so we drive refresh outcomes directly. The session
// tells a real 401 (`AuthError` of kind "rejected") apart from a transient
// failure purely by the thrown error's kind — that is the contract under test.
vi.mock("./authApi", async () => {
  const actual = await vi.importActual<typeof import("./authApi")>("./authApi");
  return { AuthError: actual.AuthError, authApi: { login: vi.fn(), refresh: vi.fn() } };
});

// Side-effect collaborators of session teardown — mocked so the test stays
// focused on the refresh outcome and free of the persisted store's localStorage.
vi.mock("@app/store/appStore", () => ({
  useAppStore: { getState: () => ({ setSelectedTenantId: vi.fn() }) },
}));
vi.mock("@shared/api/queryClient", () => ({
  queryClient: { clear: vi.fn() },
}));

import { authApi } from "./authApi";
import { session } from "./session";

const authApiMock = vi.mocked(authApi);

const rejected = new AuthError("unauthorized", "rejected");
const unavailable = new AuthError("network down", "unavailable");

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
  // Return the module to a signed-out state so store status can't leak between
  // tests (session state is module-level).
  authApiMock.refresh.mockRejectedValue(rejected);
  await session.refreshAccessToken();
});

describe("session refresh resilience", () => {
  it("keeps the session on a transient refresh failure", async () => {
    authApiMock.refresh.mockRejectedValue(unavailable);

    const token = await session.refreshAccessToken();

    expect(token).toBeNull();
    expect(useAuthStore.getState().status).toBe("authenticated");
    expect(session.getAccessToken()).toBe("opaque-access-token");
  });

  it("ends the session on a definitive 401", async () => {
    authApiMock.refresh.mockRejectedValue(rejected);

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

describe("session restore (boot recovery)", () => {
  it("reports authenticated from the in-memory token without a network call", async () => {
    await expect(session.restore()).resolves.toBe("authenticated");
    expect(authApiMock.refresh).not.toHaveBeenCalled();
  });

  it("reports unauthenticated after a definitive logout without re-hitting the backend", async () => {
    authApiMock.refresh.mockRejectedValue(rejected);
    await session.refreshAccessToken(); // definitive 401 tears the session down
    authApiMock.refresh.mockClear();

    await expect(session.restore()).resolves.toBe("unauthenticated");
    expect(authApiMock.refresh).not.toHaveBeenCalled();
  });

  it("can force a retry after another browser tab signs in", async () => {
    authApiMock.refresh.mockRejectedValueOnce(rejected);
    await session.refreshAccessToken();
    authApiMock.refresh.mockClear();
    authApiMock.refresh.mockResolvedValueOnce({ ...payload, accessToken: "cross-tab-token" });

    await expect(session.restore({ force: true })).resolves.toBe("authenticated");

    expect(authApiMock.refresh).toHaveBeenCalledOnce();
    expect(session.getAccessToken()).toBe("cross-tab-token");
  });
});
