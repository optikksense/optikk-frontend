import { createRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Suspense, lazy } from "react";

import { Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import type { rootRoute } from "./router";

const LoginPage = lazy(() => import("@/app/auth"));
const MarketingLayout = lazy(() => import("@/features/marketing/MarketingLayout"));

const HomePageLazy = lazy(() => import("@/features/marketing/pages/HomePage/HomePage"));
const FeaturesPageLazy = lazy(() => import("@/features/marketing/pages/FeaturesPage/FeaturesPage"));
const PricingPageLazy = lazy(() => import("@/features/marketing/pages/PricingPage/PricingPage"));
const OpenTelemetryPageLazy = lazy(
  () => import("@/features/marketing/pages/OpenTelemetryPage/OpenTelemetryPage")
);
const SelfHostPageLazy = lazy(() => import("@/features/marketing/pages/SelfHostPage/SelfHostPage"));
const ArchitecturePageLazy = lazy(
  () => import("@/features/marketing/pages/ArchitecturePage/ArchitecturePage")
);
const PrivacyPolicyPageLazy = lazy(
  () => import("@/features/marketing/pages/PrivacyPolicyPage/PrivacyPolicyPage")
);
const TermsOfServicePageLazy = lazy(
  () => import("@/features/marketing/pages/TermsOfServicePage/TermsOfServicePage")
);
const SecurityPageLazy = lazy(
  () => import("@/features/marketing/pages/SecurityPage/SecurityPage")
);


function PageTransition({ children }: { children: ReactNode }) {
  return <div style={{ width: "100%", height: "100%" }}>{children}</div>;
}

function buildHomeRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: "/",
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <HomePageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildFeaturesRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.features.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <FeaturesPageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildPricingRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.pricing.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <PricingPageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildOtelRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.opentelemetry.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <OpenTelemetryPageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildSelfHostRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.selfHost.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <SelfHostPageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildArchRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.architecture.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <ArchitecturePageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildPrivacyRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.privacy.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <PrivacyPolicyPageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildTermsRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.terms.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <TermsOfServicePageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildSecurityRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.security.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <SecurityPageLazy />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildLoginRoute(parent: any) {
  return createRoute({
    getParentRoute: parent,
    path: ROUTES.login,
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <LoginPage />
        </PageTransition>
      </Suspense>
    ),
  });
}

export function buildMarketingRoutes(parent: () => typeof rootRoute) {
  const marketingLayoutRoute = createRoute({
    getParentRoute: parent,
    id: "marketing-layout",
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <MarketingLayout />
      </Suspense>
    ),
  });

  const marketingChildren = [
    buildHomeRoute(marketingLayoutRoute),
    buildFeaturesRoute(marketingLayoutRoute),
    buildPricingRoute(marketingLayoutRoute),
    buildOtelRoute(marketingLayoutRoute),
    buildSelfHostRoute(marketingLayoutRoute),
    buildArchRoute(marketingLayoutRoute),
    buildPrivacyRoute(marketingLayoutRoute),
    buildTermsRoute(marketingLayoutRoute),
    buildSecurityRoute(marketingLayoutRoute),
  ];

  const productRedirectRoute = createRoute({
    getParentRoute: parent,
    path: "product",
    loader: () => {
      throw redirect({ to: ROUTES.pricing, replace: true });
    },
  });

  return {
    marketingTree: marketingLayoutRoute.addChildren(marketingChildren),
    productRedirectRoute,
    loginRoute: buildLoginRoute(parent),
  };
}
