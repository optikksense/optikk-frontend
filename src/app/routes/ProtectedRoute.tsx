import { APP_COLORS } from '@config/colorLiterals';
import { Skeleton } from 'antd';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!selectedTeamId) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `var(--bg-primary, ${APP_COLORS.hex_0a0a0a_2})`,
        }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return <>{children}</>;
}
