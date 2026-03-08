import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ErrorBoundary, Loading } from '@/shared/components/ui/feedback';
import { ROUTES } from '@/shared/constants/routes';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';

const LoginPage = lazy(() => import('@/app/auth'));
const ProductPage = lazy(() => import('@/app/auth/pages/Pricing'));
const OAuthCallbackSuccess = lazy(() =>
  import('@/app/auth/pages/OAuthCallback').then((m) => ({ default: m.OAuthCallbackSuccess }))
);
const OAuthSignupPage = lazy(() =>
  import('@/app/auth/pages/OAuthCallback').then((m) => ({ default: m.OAuthSignupPage }))
);
const ServiceDetailPage = lazy(() => import('@/features/services').then((m) => ({ default: m.ServiceDetailPageView })));
const SettingsPage = lazy(() => import('@/features/settings').then((m) => ({ default: m.SettingsPageView })));
const TraceDetailPage = lazy(() => import('@/features/traces').then((m) => ({ default: m.TraceDetailPageView })));
const BackendDrivenPage = lazy(() => import('./BackendDrivenPage'));

function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) {
    return '';
  }
  return path.startsWith('/') ? path.slice(1) : path;
}

export default function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={(
          <Suspense fallback={<Loading fullscreen />}>
            <LoginPage />
          </Suspense>
        )}
      />

      <Route
        path={ROUTES.product}
        element={(
          <Suspense fallback={<Loading fullscreen />}>
            <ProductPage />
          </Suspense>
        )}
      />

      <Route
        path="/oauth/success"
        element={(
          <Suspense fallback={<Loading fullscreen />}>
            <OAuthCallbackSuccess />
          </Suspense>
        )}
      />

      <Route
        path="/oauth/signup"
        element={(
          <Suspense fallback={<Loading fullscreen />}>
            <OAuthSignupPage />
          </Suspense>
        )}
      />

      <Route
        path={ROUTES.home}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.overview} replace />} />
        <Route
          path={toNestedRoutePath(ROUTES.settings)}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<Loading fullscreen />}>
                <SettingsPage />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path={toNestedRoutePath(ROUTES.traceDetail)}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<Loading fullscreen />}>
                <TraceDetailPage />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path={toNestedRoutePath(ROUTES.serviceDetail)}
          element={(
            <ErrorBoundary>
              <Suspense fallback={<Loading fullscreen />}>
                <ServiceDetailPage />
              </Suspense>
            </ErrorBoundary>
          )}
        />
        <Route
          path="errors"
          element={<Navigate to={`${ROUTES.overview}?tab=errors`} replace />}
        />
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
          element={(
            <ErrorBoundary>
              <Suspense fallback={<Loading fullscreen />}>
                <BackendDrivenPage />
              </Suspense>
            </ErrorBoundary>
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.product} replace />} />
    </Routes>
  );
}
