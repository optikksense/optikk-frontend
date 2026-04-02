import { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { getExplorerRoutes } from '@/app/registry/domainRegistry';
import { ErrorBoundary, Loading, FeatureErrorBoundary } from '@/shared/components/ui/feedback';
import { ROUTES } from '@/shared/constants/routes';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';
import { lazy } from 'react';

const LoginPage = lazy(() => import('@/app/auth'));
const ProductPage = lazy(() => import('@/app/auth/pages/Pricing'));
const BackendDrivenPage = lazy(() => import('./BackendDrivenPage'));

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
        {protectedExplorerRoutes.map((route) => renderProtectedRoute(route.path, route.page))}
        <Route path="errors" element={<Navigate to={`${ROUTES.overview}?tab=errors`} replace />} />
        <Route
          path={toNestedRoutePath(ROUTES.latencyAlias)}
          element={<Navigate to={`${ROUTES.metrics}?tab=latency-analysis`} replace />}
        />
        <Route
          path="service-map"
          element={<Navigate to={`${ROUTES.services}?tab=service-map`} replace />}
        />
        <Route
          path="*"
          element={
            <ErrorBoundary showDetails={import.meta.env.DEV} boundaryName="route:backend-driven">
              <Suspense fallback={<Loading fullscreen />}>
                <BackendDrivenPage />
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
