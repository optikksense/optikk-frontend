import { createFileRoute, redirect } from "@tanstack/react-router";

import { session } from "@shared/api/auth/session";

import { ROUTES } from "@/shared/constants/routes";

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
});
