import { ROUTES } from "@/shared/constants/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/alerts/new")({
  loader: () => {
    throw redirect({ to: ROUTES.monitorsNew, replace: true });
  },
});
