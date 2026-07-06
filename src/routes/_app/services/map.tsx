import { ROUTES } from "@/shared/constants/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/services/map")({
  loader: () => {
    throw redirect({ to: `${ROUTES.services}?tab=map` as never, replace: true });
  },
});
