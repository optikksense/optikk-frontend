import { createRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Suspense, lazy } from "react";

import { Loading } from "@/shared/components/ui/feedback";
import { ROUTES } from "@/shared/constants/routes";

import type { rootRoute } from "./router";

const LoginPage = lazy(() => import("@/app/auth"));
const MarketingLayout = lazy(() => import("@/features/marketing/MarketingLayout"));
const MarketingShellLazy = lazy(() =>
  import("@/features/marketing/MarketingShell").then((m) => ({ default: m.MarketingShell }))
);

function PageTransition({ children }: { children: ReactNode }) {
  return <div style={{ width: "100%", height: "100%" }}>{children}</div>;
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

  function marketingChild(path: string) {
    const normalized = path === ROUTES.home ? "/" : path.replace(/^\//, "");
    return createRoute({
      getParentRoute: () => marketingLayoutRoute,
      path: normalized,
      component: () => (
        <Suspense fallback={<Loading fullscreen />}>
          <PageTransition>
            <MarketingShellLazy path={path} />
          </PageTransition>
        </Suspense>
      ),
    });
  }

  const marketingChildren = [
    marketingChild(ROUTES.home),
    marketingChild(ROUTES.features),
    marketingChild(ROUTES.pricing),
    marketingChild(ROUTES.opentelemetry),
    marketingChild(ROUTES.selfHost),
    marketingChild(ROUTES.architecture),
  ];

  const productRedirectRoute = createRoute({
    getParentRoute: parent,
    path: "product",
    loader: () => {
      throw redirect({ to: ROUTES.pricing, replace: true });
    },
  });

  const loginRoute = createRoute({
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

  return {
    marketingTree: marketingLayoutRoute.addChildren(marketingChildren),
    productRedirectRoute,
    loginRoute,
  };
}
