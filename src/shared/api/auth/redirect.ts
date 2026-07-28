import { ROUTES } from "@shared/constants/routes";

/** Accepts app-internal paths only; protocol-relative URLs are external. */
export function safeAuthRedirect(candidate: string | undefined): string {
  return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : ROUTES.overview;
}
