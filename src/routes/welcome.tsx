import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy } from "react";

import { session } from "@shared/api/auth/session";

import { ROUTES } from "@/shared/constants/routes";

const WelcomePage = lazy(() => import("@/app/auth/pages/WelcomePage"));

// Authed but rendered full-screen (no MainLayout shell), like login/signup.
export const Route = createFileRoute("/welcome")({
  beforeLoad: async ({ location }) => {
    if (!(await session.ensureSession())) {
      throw redirect({
        to: ROUTES.login,
        search: { redirect: location.href },
        replace: true,
      });
    }
  },
  component: () => <WelcomePage />,
});
