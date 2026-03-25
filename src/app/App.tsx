import { Skeleton } from '@/components/ui';
import { Suspense } from 'react';

import { APP_COLORS } from '@config/colorLiterals';
import { useAuthValidation } from '@shared/hooks/useAuthValidation';
import { BUILT_IN_DASHBOARD_PANELS } from '@shared/components/ui/dashboard/builtInDashboardPanels';
import { DashboardPanelRegistryProvider } from '@shared/components/ui/dashboard/dashboardPanelRegistry';

import AuthExpiryListener from './providers/AuthExpiryListener';
import { getDashboardPanelRegistrations } from './registry/domainRegistry';
import AppRoutes from './routes/appRoutes';
import { ErrorBoundary } from '@shared/components/ui/feedback';

function PageLoader(): JSX.Element {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: 'min(720px, 92vw)' }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    </div>
  );
}

/**
 * Inner component rendered inside BrowserRouter so that useNavigate works.
 * Probes the backend session once on mount; shows a loader while in-flight.
 */
function AppContent(): JSX.Element {
  const authState = useAuthValidation();

  if (authState === 'pending') {
    return <PageLoader />;
  }

  return (
    <>
      <AuthExpiryListener />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(circle at 15% 50%, ${APP_COLORS.rgba_94_96_206_0p08}, transparent 25%),
            radial-gradient(circle at 85% 30%, ${APP_COLORS.rgba_78_168_222_0p08}, transparent 25%)
          `,
          pointerEvents: 'none',
        }}
      />
      <AppRoutes />
    </>
  );
}

export default function App(): JSX.Element {
  const dashboardPanels = [
    ...BUILT_IN_DASHBOARD_PANELS,
    ...getDashboardPanelRegistrations(),
  ];

  return (
    <ErrorBoundary
      showDetails={import.meta.env.DEV}
      boundaryName="app-shell"
    >
      <DashboardPanelRegistryProvider registrations={dashboardPanels}>
        <Suspense fallback={<PageLoader />}>
          <AppContent />
        </Suspense>
      </DashboardPanelRegistryProvider>
    </ErrorBoundary>
  );
}
