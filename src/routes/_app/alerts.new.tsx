import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/shared/constants/routes";

export const Route = createFileRoute("/_app/alerts/new")({
  loader: () => {
    throw redirect({ to: ROUTES.monitorsNew, replace: true });
  },
});
