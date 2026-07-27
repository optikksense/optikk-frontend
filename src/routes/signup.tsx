import { ROUTES } from "@/shared/constants/routes";
import { session } from "@/shared/api/auth/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/signup")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: async ({ search }) => {
    const outcome = await session.restore();
    if (outcome === "authenticated") {
      throw redirect({ to: search.redirect || ROUTES.overview });
    }
  },
});

