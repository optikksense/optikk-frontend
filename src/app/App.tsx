import { BUILT_IN_DASHBOARD_PANELS } from "@shared/components/ui/dashboard/builtInDashboardPanels";
import { DashboardPanelRegistryProvider } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useAuthValidation } from "@shared/hooks/useAuthValidation";

import { ErrorBoundary } from "@shared/components/ui/feedback";
import { Outlet, RouterProvider } from "@tanstack/react-router";
import { CommandPalette } from "./layout/CommandPalette";
import AuthExpiryListener from "./providers/AuthExpiryListener";
import { getDashboardPanelRegistrations } from "./registry/domainRegistry";
import { router } from "./routes/router";

/**
 * Inner component rendered inside BrowserRouter so that useNavigate works.
 * Kicks off a background re-validation of the persisted session (see
 * useAuthValidation) but does NOT gate the initial render on it — protected
 * API calls independently validate the cookie, so rendering the shell
 * optimistically is safe and shaves a 200-400ms RTT off every page load.
 */
export function AppContent(): JSX.Element {
  useAuthValidation();

  return (
    <>
      <AuthExpiryListener />
      <CommandPalette />
      <Outlet />
    </>
  );
}

const DASHBOARD_PANELS = [
  ...BUILT_IN_DASHBOARD_PANELS,
  ...getDashboardPanelRegistrations(),
];

export default function App(): JSX.Element {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV} boundaryName="app-shell">
      <DashboardPanelRegistryProvider registrations={DASHBOARD_PANELS}>
        <RouterProvider router={router} />
      </DashboardPanelRegistryProvider>
    </ErrorBoundary>
  );
}
