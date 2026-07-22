import MainLayout from "@/app/layout/MainLayout";
import { requireSession } from "@shared/api/auth/requireSession";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ location }) => {
    await requireSession(location.href);
  },
  component: MainLayout,
});
