import { APP_COLORS } from '@config/colorLiterals';
import { ConfigProvider, theme as antdTheme } from 'antd';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

import { useAppStore } from '@store/appStore';

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const appTheme = useAppStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
  }, [appTheme]);

  const themeConfig = {
    algorithm:
      appTheme === 'light'
        ? antdTheme.defaultAlgorithm
        : antdTheme.darkAlgorithm,
    token: {
      colorPrimary: APP_COLORS.hex_5e60ce,
      colorSuccess: APP_COLORS.hex_73c991,
      colorWarning: APP_COLORS.hex_f79009,
      colorError: APP_COLORS.hex_f04438,
      colorInfo: APP_COLORS.hex_06aed5,
      borderRadius: 6,
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Layout: {
        headerBg: 'var(--bg-secondary)',
        siderBg: 'var(--bg-secondary)',
        bodyBg: 'var(--bg-primary)',
      },
      Menu: {
        darkItemBg: 'var(--bg-secondary)',
        darkItemSelectedBg: 'var(--bg-tertiary)',
      },
    },
  };

  return (
    <ConfigProvider theme={themeConfig}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-text)',
            border: '1px solid var(--toast-border)',
          },
          success: {
            iconTheme: {
              primary: APP_COLORS.hex_73c991,
              secondary: APP_COLORS.hex_fff,
            },
          },
          error: {
            iconTheme: {
              primary: APP_COLORS.hex_f04438,
              secondary: APP_COLORS.hex_fff,
            },
          },
        }}
      />
    </ConfigProvider>
  );
}
