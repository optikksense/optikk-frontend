import { createRoute } from "@tanstack/react-router"

import { protectedRoute } from "@/app/router/base-routes"
import {
  LegacyAiRoute,
  LegacyErrorsRoute,
  LegacyLlmRoute,
  LegacyLogsPatternsRoute,
  LegacyLogsTransactionsRoute,
  LegacySaturationDatabaseRoute,
  LegacySaturationRedisRoute,
  LegacyServiceRoute,
} from "@/app/router/route-components"

export const legacyRoutes = [
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "logs/patterns",
    component: LegacyLogsPatternsRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "logs/transactions",
    component: LegacyLogsTransactionsRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "errors",
    component: LegacyErrorsRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "ai",
    component: LegacyAiRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "llm",
    component: LegacyLlmRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "services/$serviceName",
    component: LegacyServiceRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "saturation/database/$dbSystem",
    component: LegacySaturationDatabaseRoute,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "saturation/redis/$instance",
    component: LegacySaturationRedisRoute,
  }),
]
