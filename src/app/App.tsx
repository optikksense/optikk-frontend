import { Skeleton } from "@/components/ui";
import { Suspense } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { BUILT_IN_DASHBOARD_PANELS } from "@shared/components/ui/dashboard/builtInDashboardPanels";
import { DashboardPanelRegistryProvider } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useAuthValidation } from "@shared/hooks/useAuthValidation";

import { ErrorBoundary } from "@shared/components/ui/feedback";
import { Outlet, RouterProvider } from "@tanstack/react-router";
import { CommandPalette } from "./layout/CommandPalette";
import AuthExpiryListener from "./providers/AuthExpiryListener";
import { getDashboardPanelRegistrations } from "./registry/domainRegistry";
import { router } from "./routes/router";

function PageLoader(): JSX.Element {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(720px, 92vw)" }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    </div>
  );
}

/**
 * Inner component rendered inside BrowserRouter so that useNavigate works.
 * Probes the backend session once on mount; shows a loader while in-flight.
 */
export function AppContent(): JSX.Element {
  const authState = useAuthValidation();

  if (authState === "pending") {
    return <PageLoader />;
  }

  return (
    <>
      <AuthExpiryListener />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(circle at 15% 50%, ${APP_COLORS.rgba_94_96_206_0p08}, transparent 25%),
            radial-gradient(circle at 85% 30%, ${APP_COLORS.rgba_78_168_222_0p08}, transparent 25%)
          `,
          pointerEvents: "none",
        }}
      />
      <CommandPalette />
      <Outlet />
    </>
  );
}

export default function App(): JSX.Element {
  const dashboardPanels = [...BUILT_IN_DASHBOARD_PANELS, ...getDashboardPanelRegistrations()];

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV} boundaryName="app-shell">
      <DashboardPanelRegistryProvider registrations={dashboardPanels}>
        <RouterProvider router={router} />
      </DashboardPanelRegistryProvider>
    </ErrorBoundary>
  );
}
