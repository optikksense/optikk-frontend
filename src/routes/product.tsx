import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/shared/constants/routes";

export const Route = createFileRoute("/product")({
  loader: () => {
    throw redirect({ to: ROUTES.selfHost, replace: true });
  },
});
