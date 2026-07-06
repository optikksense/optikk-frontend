import { ROUTES } from "@/shared/constants/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/logs/patterns")({
  loader: () => {
    throw redirect({ to: ROUTES.logs, replace: true });
  },
});
