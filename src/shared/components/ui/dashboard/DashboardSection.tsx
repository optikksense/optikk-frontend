import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';

import type { DashboardSectionSpec } from '@/types/dashboardConfig';

import SectionHeader from './SectionHeader';

interface DashboardSectionProps {
  section: DashboardSectionSpec;
  storageKey: string;
  children: ReactNode;
}

function readCollapsedState(storageKey: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(storageKey) === 'true';
  } catch {
    return false;
  }
}

export default function DashboardSection({
  section,
  storageKey,
  children,
}: DashboardSectionProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsedState(storageKey));

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, collapsed ? 'true' : 'false');
    } catch {
      // Ignore storage write failures; collapse state is a view preference only.
    }
  }, [collapsed, storageKey]);

  return (
    <section className="rounded-[var(--card-radius)]">
      <SectionHeader
        title={section.title}
        collapsible={section.collapsible}
        collapsed={collapsed}
        onToggle={section.collapsible ? () => setCollapsed((prev) => !prev) : undefined}
      />
      {!collapsed && children}
    </section>
  );
}
