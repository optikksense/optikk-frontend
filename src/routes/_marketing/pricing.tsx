import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/shared/constants/routes";

export const Route = createFileRoute("/_marketing/pricing")({
  loader: () => {
    throw redirect({ to: ROUTES.selfHost, replace: true });
  },
});
