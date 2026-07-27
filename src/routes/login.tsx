import { ROUTES } from "@/shared/constants/routes";
import { session } from "@/shared/api/auth/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional(), token: z.string().optional() }),
  beforeLoad: async ({ search }) => {
    if (search.token) {
      return;
    }
    const outcome = await session.restore();
    if (outcome === "authenticated") {
      throw redirect({ to: search.redirect || ROUTES.overview });
    }
  },
});

