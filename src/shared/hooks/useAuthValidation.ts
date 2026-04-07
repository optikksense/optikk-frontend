import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { authService } from '@shared/api/auth/authService';

import { useAuthStore } from '@store/authStore';

export type AuthValidationState = 'pending' | 'valid' | 'invalid';

/**
 * Validates the current auth session on mount.
 *
 * On first render, if the auth-present flag is set, this hook fires a
 * lightweight probe to GET /auth/me. If the server rejects the cookie-backed
 * session (401), it clears all auth state and returns 'invalid' so the caller
 * can redirect to /login. Returns 'pending' while the probe is in-flight.
 *
 * If the auth-present flag is absent, returns 'invalid' immediately (no probe).
 */
export function useAuthValidation(): AuthValidationState {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const applyAuthPayload = useAuthStore((state) => state.applyAuthPayload);
  const clearSession = useAuthStore((state) => state.clearSession);

  const [state, setState] = useState<AuthValidationState>(() => {
    if (!isAuthenticated) {
      return 'invalid';
    }
    return 'pending';
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setState('invalid');
      return;
    }

    let cancelled = false;

    void (async () => {
      const payload = await authService.validateSession();
      if (cancelled) {
        return;
      }

      if (payload && applyAuthPayload(payload)) {
        setState('valid');
      } else {
        clearSession();
        setState('invalid');
        navigate({ to: '/login', replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyAuthPayload, clearSession, isAuthenticated, navigate]);

  return state;
}
