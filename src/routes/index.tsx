import { session } from "@/shared/api/auth/session";
import { ROUTES } from "@/shared/constants/routes";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const outcome = await session.restore();
    if (outcome === "authenticated") {
      throw redirect({ to: ROUTES.overview });
    }
    throw redirect({ to: ROUTES.login });
  },
});
