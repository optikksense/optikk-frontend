import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/shared/constants/routes";

export const Route = createFileRoute("/_app/services/map")({
  loader: () => {
    throw redirect({ to: `${ROUTES.services}?tab=map` as any, replace: true });
  },
});
