import { ROUTES } from "@/shared/constants/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/product")({
  loader: () => {
    throw redirect({ to: ROUTES.selfHost as never, replace: true });
  },
});
