import { redirect } from "@tanstack/react-router";

import { ROUTES } from "@/shared/constants/routes";

import { session } from "./session";

   
                                                                            
                                                                           
                                                                              
                                                 
   
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
