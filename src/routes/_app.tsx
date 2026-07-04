import { createFileRoute, redirect } from "@tanstack/react-router";
import { session } from "@shared/api/auth/session";
import { ROUTES } from "@/shared/constants/routes";
import MainLayout from "@/app/layout/MainLayout";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    if (!(await session.ensureSession())) {
      throw redirect({
        to: ROUTES.login,
        search: { redirect: location.href },
        replace: true,
      });
    }
  },
  component: MainLayout,
});
