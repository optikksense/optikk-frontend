import { createRoute } from "@tanstack/react-router"

import { marketingLayoutRoute } from "@/app/router/base-routes"
import { createMarketingPage } from "@/app/router/route-components"
import { LoginPage } from "@/features/auth/LoginPage"
import { ROUTES } from "@/platform/config/routes"

function createMarketingRoute(path: string) {
  return createRoute({
    getParentRoute: () => marketingLayoutRoute,
    path: path === "/" ? "/" : path.slice(1),
    component: createMarketingPage(path),
  })
}

export const marketingRoutes = [
  createMarketingRoute(ROUTES.home),
  createMarketingRoute(ROUTES.features),
  createMarketingRoute(ROUTES.pricing),
  createMarketingRoute(ROUTES.architecture),
  createMarketingRoute(ROUTES.opentelemetry),
  createMarketingRoute(ROUTES.selfHost),
  createRoute({
    getParentRoute: () => marketingLayoutRoute,
    path: ROUTES.login.slice(1),
    component: LoginPage,
  }),
]
