import { Skeleton } from 'antd';
import { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { authService } from '@shared/api/auth/authService';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { APP_COLORS } from '@config/colorLiterals';

import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

/**
 * Renders children when authenticated + a team is selected.
 *
 * Edge-case handled: if the auth flag is set but `selectedTeamId` is missing
 * (e.g. clearAuthStorage ran, but the auth:expired event was dropped), we
 * probe the backend once. A failed probe redirects to /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const applyAuthPayload = useAuthStore((state) => state.applyAuthPayload);
  const clearSession = useAuthStore((state) => state.clearSession);
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const probeStarted = useRef(false);

  // When auth flag is set but teamId is gone, probe the backend once.
  useEffect(() => {
    if (!isAuthenticated || selectedTeamId !== null || probeStarted.current) {
      return;
    }

    probeStarted.current = true;

    void (async () => {
      const payload = await authService.validateSession();
      if (!payload || !applyAuthPayload(payload)) {
        clearSession();
        navigate('/login', { replace: true });
      }
    })();
  }, [applyAuthPayload, clearSession, isAuthenticated, navigate, selectedTeamId]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!selectedTeamId) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
