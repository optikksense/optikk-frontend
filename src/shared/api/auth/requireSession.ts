import { redirect } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

import { session } from "./session";

/**
 * Boot guard shared by every authed route. A definitive rejection routes to
 * `/login`; a transient failure throws to the root `errorComponent`'s "Try
 * Again" screen instead of logging the user out. `redirectTo` is preserved so
 * a real login lands back on the requested page.
 */
export async function requireSession(redirectTo: string): Promise<void> {
  const outcome = await session.restore();
  if (outcome === "authenticated") {
    return;
  }
  if (outcome === "unauthenticated") {
    throw redirect({ to: ROUTES.login, search: { redirect: redirectTo }, replace: true });
  }
  throw new Error("Can't reach the server — check your connection and try again.");
}
