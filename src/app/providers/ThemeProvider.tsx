import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

import { useAppStore } from "@store/appStore";

import { APP_COLORS } from "@config/colorLiterals";

import type { ReactNode } from "react";

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const appTheme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appTheme);
    if (appTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [appTheme]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--toast-bg)",
            color: "var(--toast-text)",
            border: "1px solid var(--toast-border)",
          },
          success: {
            iconTheme: {
              primary: APP_COLORS.hex_52876b,
              secondary: APP_COLORS.hex_fff,
            },
          },
          error: {
            iconTheme: {
              primary: APP_COLORS.hex_dc2626,
              secondary: APP_COLORS.hex_fff,
            },
          },
        }}
      />
    </>
  );
}
