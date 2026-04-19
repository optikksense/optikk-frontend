import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { authService } from "@shared/api/auth/authService";

import { useAuthStore } from "@store/authStore";

/**
 * Fires a lightweight background probe to GET /auth/me to re-validate the
 * cookie-backed session on mount. **Does NOT block rendering** — the app
 * trusts the persisted localStorage auth flag for the initial paint and runs
 * this probe asynchronously. If the probe 401s we clear the session and
 * redirect to /login.
 *
 * The worst case is that a user with a silently-expired token sees the shell
 * for ~200-400ms before being redirected, but no protected data leaks because
 * every downstream API call independently validates the session cookie. The
 * win is that every page load (and full-page reload) is ~200-400ms faster.
 *
 * If the auth-present flag is absent, the probe is skipped entirely.
 */
export function useAuthValidation(): void {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const applyAuthPayload = useAuthStore((state) => state.applyAuthPayload);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const payload = await authService.validateSession();
      if (cancelled) {
        return;
      }

      if (payload && applyAuthPayload(payload)) {
        // Session still valid; applyAuthPayload refreshed the store with any
        // server-side updates (team membership changes, role changes, etc.).
        return;
      }

      clearSession();
      navigate({ to: "/login", replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [applyAuthPayload, clearSession, isAuthenticated, navigate]);
}
