import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useAuthStore } from '@store/authStore';

export default function AuthExpiryListener(): null {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      useAuthStore.getState().clearSession();
      navigate({ to: '/login', replace: true });
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [navigate]);

  return null;
}
