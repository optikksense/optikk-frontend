import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

import { safeAuthRedirect } from "@shared/api/auth/redirect";
import { session } from "@shared/api/auth/session";
import { subscribeToSessionEvents } from "@shared/api/auth/sessionEvents";
import { ROUTES } from "@shared/constants/routes";

const AUTH_ENTRY_PATHS = new Set<string>([ROUTES.login, ROUTES.signup]);

export default function CrossTabSessionSync(): null {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthEntry = AUTH_ENTRY_PATHS.has(location.pathname);

  const restorePublicTab = useCallback(async (): Promise<void> => {
    if (!isAuthEntry) {
      return;
    }
    const outcome = await session.restore({ force: true });
    if (outcome !== "authenticated") {
      return;
    }
    const redirect = new URLSearchParams(location.searchStr).get("redirect") ?? undefined;
    await navigate({ to: safeAuthRedirect(redirect) as string & {}, replace: true });
  }, [isAuthEntry, location.searchStr, navigate]);

  useEffect(
    () =>
      subscribeToSessionEvents((event) => {
        if (event === "signed-in") {
          void restorePublicTab();
          return;
        }
        session.acceptExternalLogout();
      }),
    [restorePublicTab]
  );

  useEffect(() => {
    if (!isAuthEntry) {
      return;
    }
    const onFocus = (): void => {
      void restorePublicTab();
    };
    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        void restorePublicTab();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthEntry, restorePublicTab]);

  return null;
}
