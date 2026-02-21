import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from '@components/common/ErrorBoundary';
import { useAppStore } from '@store/appStore';
import App from './App';
import './utils/chartSetup';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      refetchOnReconnect: true,
      retry: 0,
      staleTime: 0,
      gcTime: 30_000,
    },
  },
});

function AppProviders() {
  const appTheme = useAppStore((state) => state.theme);

  const themeConfig = {
    algorithm: appTheme === 'light' ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
    token: {
      colorPrimary: '#5E60CE',
      colorSuccess: '#73C991',
      colorWarning: '#F79009',
      colorError: '#F04438',
      colorInfo: '#06AED5',
      borderRadius: 6,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      <ErrorBoundary showDetails={import.meta.env.DEV}>
        <App />
      </ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: appTheme === 'light' ? '#FFFFFF' : '#1A1A1A',
            color: appTheme === 'light' ? '#1A1A2E' : '#FFFFFF',
            border: appTheme === 'light' ? '1px solid #E5E7EB' : '1px solid #2D2D2D',
          },
          success: {
            iconTheme: {
              primary: '#73C991',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#F04438',
              secondary: '#fff',
            },
          },
        }}
      />
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProviders />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
