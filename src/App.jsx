import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from 'antd';
import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';
import ErrorBoundary from '@components/common/feedback/ErrorBoundary';
import MainLayout from '@components/layout/MainLayout';
import LoginPage from '@features/auth/pages/LoginPage';
import TracesPage from '@features/traces/pages/TracesPage';
import TraceDetailPage from '@features/traces/pages/TraceDetailPage';
import ServicesPage from '@features/services/pages/ServicesPage';
import ServiceDetailPage from '@features/services/pages/ServiceDetailPage';
import AlertsHubPage from '@features/alerts/pages/AlertsHubPage';
import MetricsPage from '@features/metrics/pages/MetricsPage';
import SettingsPage from '@features/settings/pages/SettingsPage';
import ErrorDashboardPage from '@features/errors/pages/ErrorDashboardPage';
import AiObservabilityPage from '@features/ai/pages/AiObservabilityPage';
import OverviewHubPage from '@features/overview/pages/OverviewHubPage';
import LogsHubPage from '@features/log/pages/LogsHubPage';
import InfrastructureHubPage from '@features/infrastructure/pages/InfrastructureHubPage';
import SaturationHubPage from '@features/metrics/pages/SaturationHubPage';

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
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
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
        <Route path="service-map" element={<Navigate to="/services?tab=topology" replace />} />
        <Route path="alerts" element={<ErrorBoundary><AlertsHubPage /></ErrorBoundary>} />
        <Route path="metrics" element={<ErrorBoundary><MetricsPage /></ErrorBoundary>} />
        <Route path="incidents" element={<Navigate to="/alerts?tab=incidents" replace />} />
        <Route path="infrastructure" element={<ErrorBoundary><InfrastructureHubPage /></ErrorBoundary>} />
        <Route path="errors" element={<ErrorBoundary><ErrorDashboardPage /></ErrorBoundary>} />
        <Route path="saturation" element={<ErrorBoundary><SaturationHubPage /></ErrorBoundary>} />
        <Route path="ai-observability" element={<ErrorBoundary><AiObservabilityPage /></ErrorBoundary>} />
        <Route path="settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
        <Route path="deployments" element={<Navigate to="/infrastructure?tab=deployments" replace />} />
        <Route path="latency" element={<Navigate to="/metrics?tab=latency" replace />} />
        <Route path="health-checks" element={<Navigate to="/infrastructure?tab=health-checks" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
