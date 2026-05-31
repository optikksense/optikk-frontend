import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAuthError, useAuthStore, useIsAuthenticated } from "@store/authStore";

import { LoginBrandPanel } from "./LoginBrandPanel";
import { LoginFooter } from "./LoginFooter";
import { LoginForm } from "./LoginForm";
import { LoginHeader } from "./LoginHeader";
import { LoginTopBar } from "./LoginTopBar";

export function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const error = useAuthError();
  const clearError = useAuthStore((s) => s.clearError);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/overview" });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-surface-canvas text-foreground lg:grid-cols-[1.05fr_1fr]">
      <LoginBrandPanel />
      <main className="grid grid-rows-[auto_1fr_auto] px-12 py-7 max-md:px-6 max-md:py-5">
        <LoginTopBar />
        <div className="mx-auto w-full max-w-[380px] self-center py-7">
          <LoginHeader />
          <LoginForm />
        </div>
        <LoginFooter />
      </main>
    </div>
  );
}
