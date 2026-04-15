import { createRoute } from "@tanstack/react-router"

import { protectedRoute } from "@/app/router/base-routes"
import { AlertRuleDetailPage } from "@/features/alerts/AlertRuleDetailPage"
import { AlertRuleEditorPage } from "@/features/alerts/AlertRuleEditorPage"
import { AlertsPage } from "@/features/alerts/AlertsPage"
import { SettingsPage } from "@/features/settings/SettingsPage"

export const alertRoutes = [
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "alerts",
    component: AlertsPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "alerts/rules/new",
    component: AlertRuleEditorPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "alerts/rules/$ruleId",
    component: AlertRuleDetailPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "alerts/rules/$ruleId/edit",
    component: AlertRuleEditorPage,
  }),
  createRoute({
    getParentRoute: () => protectedRoute,
    path: "settings",
    component: SettingsPage,
  }),
]
