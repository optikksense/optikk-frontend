import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { ROUTES } from "@/shared/constants/routes";

import { useAuthStatus } from "@store/authStore";

/**
 * Sends the user to /login when an active session ends unexpectedly (failed
 * refresh, logout). Acts only on the authenticated → unauthenticated
 * transition, so it never fires during cold boot.
 */
export default function SessionExpiryRedirect(): null {
  const status = useAuthStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const previousStatus = useRef(status);

  useEffect(() => {
    if (previousStatus.current === "authenticated" && status === "unauthenticated") {
      navigate({
        to: ROUTES.login,
        search: { redirect: location.pathname + location.searchStr },
        replace: true,
      });
    }
    previousStatus.current = status;
  }, [status, navigate, location.pathname, location.searchStr]);

  return null;
}
