import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';
import ErrorBoundary from '@components/common/feedback/ErrorBoundary';
import MainLayout from '@components/layout/MainLayout';
import { useRealtimeRefresh } from '@hooks/useRealtimeRefresh';

// ── Lazy-loaded pages ─────────────────────────────────────────────────────
// Each page is loaded on-demand, producing separate JS chunks.
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'));
const TracesPage = lazy(() => import('@features/traces/pages/TracesPage'));
const TraceDetailPage = lazy(() => import('@features/traces/pages/TraceDetailPage'));
const ServicesPage = lazy(() => import('@features/services/pages/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@features/services/pages/ServiceDetailPage'));
const MetricsPage = lazy(() => import('@features/metrics/pages/MetricsPage'));
const SettingsPage = lazy(() => import('@features/settings/pages/SettingsPage'));
const ErrorDashboardPage = lazy(() => import('@features/errors/pages/ErrorDashboardPage'));
const AiObservabilityPage = lazy(() => import('@features/ai/pages/AiObservabilityPage'));
const OverviewHubPage = lazy(() => import('@features/overview/pages/OverviewHubPage'));
const LogsHubPage = lazy(() => import('@features/log/pages/LogsHubPage'));
const InfrastructureHubPage = lazy(() => import('@features/infrastructure/pages/InfrastructureHubPage'));
const SaturationHubPage = lazy(() => import('@features/metrics/pages/SaturationHubPage'));

// ── Page loading fallback ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '2rem',
    }}>
      <Skeleton active paragraph={{ rows: 6 }} style={{ maxWidth: 600 }} />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!selectedTeamId) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary, #0A0A0A)',
      }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return children;
}

function App() {
  useRealtimeRefresh();
  const theme = useAppStore((state) => state.theme);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for auth:expired events fired by the API interceptor on 401.
  // Using an event avoids the hard window.location.href redirect that
  // destroyed all SPA state.
  useEffect(() => {
    const handleAuthExpired = () => navigate('/login', { replace: true });
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [navigate]);

  return (
    <Suspense fallback={<PageLoader />}>
      {/* Dynamic Background Mesh */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(circle at 15% 50%, rgba(94, 96, 206, 0.08), transparent 25%),
            radial-gradient(circle at 85% 30%, rgba(78, 168, 222, 0.08), transparent 25%)
          `,
          pointerEvents: 'none'
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<ErrorBoundary><OverviewHubPage /></ErrorBoundary>} />
          <Route path="logs" element={<ErrorBoundary><LogsHubPage /></ErrorBoundary>} />
          <Route path="traces" element={<ErrorBoundary><TracesPage /></ErrorBoundary>} />
          <Route path="traces/:traceId" element={<ErrorBoundary><TraceDetailPage /></ErrorBoundary>} />
          <Route path="services" element={<ErrorBoundary><ServicesPage /></ErrorBoundary>} />
          <Route path="services/:serviceName" element={<ErrorBoundary><ServiceDetailPage /></ErrorBoundary>} />
          <Route path="metrics" element={<ErrorBoundary><MetricsPage /></ErrorBoundary>} />
          <Route path="infrastructure" element={<ErrorBoundary><InfrastructureHubPage /></ErrorBoundary>} />
          <Route path="errors" element={<ErrorBoundary><ErrorDashboardPage /></ErrorBoundary>} />
          <Route path="saturation" element={<ErrorBoundary><SaturationHubPage /></ErrorBoundary>} />
          <Route path="ai-observability" element={<ErrorBoundary><AiObservabilityPage /></ErrorBoundary>} />
          <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
          <Route path="latency" element={<Navigate to="/metrics?tab=latency" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
