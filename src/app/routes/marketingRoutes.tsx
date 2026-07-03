import { createRoute, redirect } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { Suspense, lazy } from "react";
import { z } from "zod";

import { Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import type { rootRoute } from "./router";

const LoginPage = lazy(() => import("@/app/auth"));
const SignupPage = lazy(() => import("@/app/auth/pages/SignupPage"));
const MarketingLayout = lazy(() => import("@/features/marketing/MarketingLayout"));

const HomePageLazy = lazy(() => import("@/features/marketing/pages/HomePage/HomePage"));
const FeaturesPageLazy = lazy(() => import("@/features/marketing/pages/FeaturesPage/FeaturesPage"));
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
const SecurityPageLazy = lazy(() => import("@/features/marketing/pages/SecurityPage/SecurityPage"));

function PageTransition({ children }: { children: ReactNode }) {
  return <div style={{ width: "100%", height: "100%" }}>{children}</div>;
}

function buildLazyPageRoute(parentRoute: any, path: string, LazyComponent: ComponentType<any>) {
  return createRoute({
    getParentRoute: () => parentRoute,
    path: path === "/" ? "/" : path.replace(/^\//, ""),
    component: () => (
      <Suspense fallback={<Loading fullscreen />}>
        <PageTransition>
          <LazyComponent />
        </PageTransition>
      </Suspense>
    ),
  });
}

function buildPricingRoute(layoutRoute: any) {
  return createRoute({
    getParentRoute: () => layoutRoute,
    path: ROUTES.pricing.replace(/^\//, ""),
    loader: () => {
      throw redirect({ to: ROUTES.selfHost, replace: true });
    },
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
    buildLazyPageRoute(marketingLayoutRoute, "/", HomePageLazy),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.features, FeaturesPageLazy),
    buildPricingRoute(marketingLayoutRoute),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.opentelemetry, OpenTelemetryPageLazy),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.selfHost, SelfHostPageLazy),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.architecture, ArchitecturePageLazy),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.privacy, PrivacyPolicyPageLazy),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.terms, TermsOfServicePageLazy),
    buildLazyPageRoute(marketingLayoutRoute, ROUTES.security, SecurityPageLazy),
  ];

  const productRedirectRoute = createRoute({
    getParentRoute: parent,
    path: "product",
    loader: () => {
      throw redirect({ to: ROUTES.selfHost, replace: true });
    },
  });

  return {
    marketingTree: marketingLayoutRoute.addChildren(marketingChildren),
    productRedirectRoute,
    loginRoute: createRoute({
      getParentRoute: parent,
      path: ROUTES.login.replace(/^\//, ""),
      validateSearch: z.object({ redirect: z.string().optional() }),
      component: () => (
        <Suspense fallback={<Loading fullscreen />}>
          <LoginPage />
        </Suspense>
      ),
    }),
    signupRoute: createRoute({
      getParentRoute: parent,
      path: ROUTES.signup.replace(/^\//, ""),
      component: () => (
        <Suspense fallback={<Loading fullscreen />}>
          <SignupPage />
        </Suspense>
      ),
    }),
  };
}
