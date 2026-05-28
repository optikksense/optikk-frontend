import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAuthError, useAuthStore, useIsAuthenticated } from "@store/authStore";

import { LoginFooter } from "./LoginFooter";
import { LoginForm } from "./LoginForm";
import { LoginHeader } from "./LoginHeader";

/**
 * Login page composition root.
 * Handles auth redirect and error toasting, delegates rendering
 * to LoginHeader, LoginForm, and LoginFooter.
 */
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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 max-[480px]:px-4 max-[480px]:py-8 before:absolute before:left-0 before:right-0 before:top-0 before:h-0.5 before:bg-[var(--login-accent)] before:content-['']">
      <div className="flex w-full max-w-[480px] flex-col gap-9">
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
}
