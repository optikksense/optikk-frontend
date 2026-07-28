import { create } from "zustand";

import type { Tenant, User } from "@shared/types";

   
                                                                        
                                                                           
                                                                              
   

                                                         
type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  readonly status: AuthStatus;
  readonly user: User | null;
  readonly tenant: Tenant | null;
  readonly setSession: (user: User, tenant: Tenant | null) => void;
  readonly clearSession: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  status: "unknown",
  user: null,
  tenant: null,

  setSession: (user: User, tenant: Tenant | null): void => {
    set({ status: "authenticated", user, tenant });
  },

  clearSession: (): void => {
    set({ status: "unauthenticated", user: null, tenant: null });
  },
}));

export const useAuthUser = () => useAuthStore((s) => s.user);
export const useAuthTenant = () => useAuthStore((s) => s.tenant);
export const useAuthStatus = () => useAuthStore((s) => s.status);
