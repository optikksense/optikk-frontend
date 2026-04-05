import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { getExplorerRoutes } from '@/app/registry/domainRegistry';
import { Loading, FeatureErrorBoundary } from '@/shared/components/ui/feedback';
import { ROUTES } from '@/shared/constants/routes';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import { lazy } from 'react';
import LegacyDashboardDetailRedirect from './LegacyDashboardDetailRedirect';

const LoginPage = lazy(() => import('@/app/auth'));
const ProductPage = lazy(() => import('@/app/auth/pages/Pricing'));
const OverviewHubPage = lazy(() => import('@/features/overview/pages/OverviewHubPage'));
const MetricsPage = lazy(() => import('@/features/metrics/pages/MetricsExplorerPage'));
const SaturationHubPage = lazy(() => import('@/features/metrics/pages/SaturationHubPage'));
const InfrastructureHubPage = lazy(
  () => import('@/features/infrastructure/pages/InfrastructureHubPage')
);
const ServiceHubPage = lazy(() => import('@/features/overview/pages/ServiceHubPage'));
const AiObservabilityPage = lazy(() => import('@/features/ai/pages/AiObservabilityPage'));

function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) {
    return '';
  }
  return path.startsWith('/') ? path.slice(1) : path;
}

function PageTransition({ children }: { children: React.ReactNode }) {
  return <div style={{ width: '100%', height: '100%' }}>{children}</div>;
}

function renderProtectedRoute(path: string, Page: React.ComponentType<object>): JSX.Element {
  return (
    <Route
      key={path}
      path={toNestedRoutePath(path)}
      element={
        <FeatureErrorBoundary
          featureName={`route:${path}`}
          onError={(err, feature) => {
            // Telemetry integration point
            console.log(`[Telemetry Push] ${feature} failed:`, err);
          }}
        >
          <Suspense fallback={<Loading fullscreen />}>
            <Page />
          </Suspense>
        </FeatureErrorBoundary>
      }
    />
  );
}

export default function AppRoutes(): JSX.Element {
  const location = useLocation();
  const protectedExplorerRoutes = getExplorerRoutes();

  return (
    <Routes location={location} key={location.pathname}>
      <Route
        path={ROUTES.login}
        element={
          <Suspense fallback={<Loading fullscreen />}>
            <PageTransition>
              <LoginPage />
            </PageTransition>
          </Suspense>
        }
      />

      {/* Marketing pages */}
      {[ROUTES.home, ROUTES.product, ROUTES.pricing, ROUTES.opentelemetry, ROUTES.selfHost].map(
        (path) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<Loading fullscreen />}>
                <PageTransition>
                  <ProductPage />
                </PageTransition>
              </Suspense>
            }
          />
        )
      )}

      <Route
        path={ROUTES.home}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.overview} replace />} />
        <Route path="logs/patterns" element={<Navigate to={ROUTES.logs} replace />} />
        <Route path="logs/transactions" element={<Navigate to={ROUTES.logs} replace />} />
        {protectedExplorerRoutes.map((route) => renderProtectedRoute(route.path, route.page))}
        {renderProtectedRoute(ROUTES.overview, OverviewHubPage)}
        {renderProtectedRoute(ROUTES.metrics, MetricsPage)}
        {renderProtectedRoute(ROUTES.saturation, SaturationHubPage)}
        {renderProtectedRoute(ROUTES.infrastructure, InfrastructureHubPage)}
        {renderProtectedRoute(ROUTES.service, ServiceHubPage)}
        {renderProtectedRoute(ROUTES.aiObservability, AiObservabilityPage)}
        <Route path="errors" element={<Navigate to={`${ROUTES.overview}?tab=errors`} replace />} />
        <Route
          path="errors/:errorGroupId"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.overview}
              drawerEntity="errorGroup"
              paramKey="errorGroupId"
              tab="errors"
            />
          }
        />
        <Route
          path="infrastructure/nodes/:host"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.infrastructure}
              drawerEntity="node"
              paramKey="host"
              tab="nodes"
            />
          }
        />
        <Route
          path="saturation/database/:dbSystem"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.saturation}
              drawerEntity="databaseSystem"
              paramKey="dbSystem"
              tab="database"
            />
          }
        />
        <Route
          path="saturation/redis/:instance"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.saturation}
              drawerEntity="redisInstance"
              paramKey="instance"
              tab="redis"
            />
          }
        />
        <Route
          path="saturation/kafka/topics/:topic"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.saturation}
              drawerEntity="kafkaTopic"
              paramKey="topic"
              tab="queue"
            />
          }
        />
        <Route
          path="saturation/kafka/groups/:groupId"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.saturation}
              drawerEntity="kafkaGroup"
              paramKey="groupId"
              tab="queue"
            />
          }
        />
        <Route
          path="ai-observability/models/:modelName"
          element={
            <LegacyDashboardDetailRedirect
              parentPath={ROUTES.aiObservability}
              drawerEntity="aiModel"
              paramKey="modelName"
            />
          }
        />
        <Route
          path="services/:serviceName/operations/:operationName"
          element={<Navigate to={ROUTES.metrics} replace />}
        />
        <Route path="*" element={<Navigate to={ROUTES.overview} replace />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
