import { ROUTES } from "@shared/constants/routes";

                                                                            
export function safeAuthRedirect(candidate: string | undefined): string {
  return candidate?.startsWith("/") && !candidate.startsWith("//") ? candidate : ROUTES.overview;
}
