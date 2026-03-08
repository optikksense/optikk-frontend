import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

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

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

export default function AppRoutes(): JSX.Element {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path={ROUTES.login}
          element={(
            <Suspense fallback={<Loading fullscreen />}>
              <PageTransition><LoginPage /></PageTransition>
            </Suspense>
          )}
        />

        {/* Marketing pages */}
        {[ROUTES.home, ROUTES.product, ROUTES.pricing, ROUTES.opentelemetry, ROUTES.selfHost].map(path => (
          <Route
            key={path}
            path={path}
            element={(
              <Suspense fallback={<Loading fullscreen />}>
                <PageTransition><ProductPage /></PageTransition>
              </Suspense>
            )}
          />
        ))}

        <Route
          path="/oauth/success"
          element={(
            <Suspense fallback={<Loading fullscreen />}>
              <PageTransition><OAuthCallbackSuccess /></PageTransition>
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

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
    </AnimatePresence>
  );
}
