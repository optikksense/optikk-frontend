import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import { useAuthError, useAuthStore, useIsAuthenticated } from "@store/authStore";

import { LoginFooter } from "./LoginFooter";
import { LoginForm } from "./LoginForm";
import { LoginHeader } from "./LoginHeader";

import "./LoginPage.css";

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
    <div className="login-root">
      <div className="login-content">
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </div>
  );
}
