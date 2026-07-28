import { BUILT_IN_DASHBOARD_PANELS } from "@shared/components/ui/dashboard/builtInDashboardPanels";
import { DashboardPanelRegistryProvider } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { ErrorBoundary } from "@shared/components/ui/feedback";
import { RouterProvider, createRouter } from "@tanstack/react-router";

                                  
import { routeTree } from "../routeTree.gen";
import { getDashboardPanelRegistrations } from "./registry/domainRegistry";

                               
const router = createRouter({ routeTree });

                                               
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
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
