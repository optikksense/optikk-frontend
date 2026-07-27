import { safeAuthRedirect } from "@/shared/api/auth/redirect";
import { session } from "@/shared/api/auth/session";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/signup")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: async ({ search }) => {
    const outcome = await session.restore();
    if (outcome === "authenticated") {
      throw redirect({ to: safeAuthRedirect(search.redirect) });
    }
  },
});
