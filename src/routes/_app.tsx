import MainLayout from "@/app/layout/MainLayout";
import { ROUTES } from "@/shared/constants/routes";
import { session } from "@shared/api/auth/session";
import { createFileRoute, redirect } from "@tanstack/react-router";

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
