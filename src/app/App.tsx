import { Skeleton } from 'antd';
import { Suspense } from 'react';

import { APP_COLORS } from '@config/colorLiterals';
import { useRealtimeRefresh } from '@hooks/useRealtimeRefresh';

import AuthExpiryListener from './providers/AuthExpiryListener';
import AppRoutes from './routes/appRoutes';

function PageLoader(): JSX.Element {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: 'min(720px, 92vw)' }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  useRealtimeRefresh();

  return (
    <Suspense fallback={<PageLoader />}>
      <AuthExpiryListener />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: `
            radial-gradient(circle at 15% 50%, ${APP_COLORS.rgba_94_96_206_0p08}, transparent 25%),
            radial-gradient(circle at 85% 30%, ${APP_COLORS.rgba_78_168_222_0p08}, transparent 25%)
          `,
          pointerEvents: 'none',
        }}
      />
      <AppRoutes />
    </Suspense>
  );
}
