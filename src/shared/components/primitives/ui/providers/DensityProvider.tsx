import { createContext, use, useEffect } from 'react';

import { useAppStore } from '@store/appStore';

type Density = 'comfortable' | 'compact';

const DensityContext = createContext<Density>('comfortable');

function useDensity() {
  return use(DensityContext);
}

interface DensityProviderProps {
  children: React.ReactNode;
}

function DensityProvider({ children }: DensityProviderProps) {
  const density = useAppStore(
    (state) => state.viewPreferences?.density ?? 'comfortable'
  ) as Density;

  useEffect(() => {
    if (density === 'compact') {
      document.documentElement.setAttribute('data-density', 'compact');
      return;
    }

    document.documentElement.removeAttribute('data-density');
  }, [density]);

  return <DensityContext.Provider value={density}>{children}</DensityContext.Provider>;
}

export { DensityProvider, useDensity };
