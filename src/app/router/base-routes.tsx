import { createRootRoute, createRoute } from "@tanstack/react-router"

import { AppShell } from "@/app/layout/AppShell"
import { MarketingLayout } from "@/app/layout/MarketingLayout"
import { RequireAuth } from "@/app/router/RequireAuth"

export const rootRoute = createRootRoute()

export const marketingLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "marketing",
  component: MarketingLayout,
})

export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppShell,
})

export const protectedRoute = createRoute({
  getParentRoute: () => appRoute,
  id: "protected",
  component: RequireAuth,
})
