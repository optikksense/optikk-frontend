import { BUILT_IN_DASHBOARD_PANELS } from "@shared/components/ui/dashboard/builtInDashboardPanels";
import { DashboardPanelRegistryProvider } from "@shared/components/ui/dashboard/dashboardPanelRegistry";

import { ErrorBoundary } from "@shared/components/ui/feedback";
import { Outlet, RouterProvider } from "@tanstack/react-router";
import { CommandPalette } from "./layout/CommandPalette";
import SessionExpiryRedirect from "./providers/SessionExpiryRedirect";
import { getDashboardPanelRegistrations } from "./registry/domainRegistry";
import { router } from "./routes/router";

/**
 * Root shell. Session validation/recovery is owned by the protected route's
 * `beforeLoad` guard; runtime 401s are handled by SessionExpiryRedirect.
 */
export function AppContent(): JSX.Element {
  return (
    <>
      <SessionExpiryRedirect />
      <CommandPalette />
      <Outlet />
    </>
  );
}

const DASHBOARD_PANELS = [...BUILT_IN_DASHBOARD_PANELS, ...getDashboardPanelRegistrations()];

export default function App(): JSX.Element {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV} boundaryName="app-shell">
      <DashboardPanelRegistryProvider registrations={DASHBOARD_PANELS}>
        <RouterProvider router={router} />
      </DashboardPanelRegistryProvider>
    </ErrorBoundary>
  );
}
