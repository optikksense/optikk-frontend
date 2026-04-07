import { Link } from '@tanstack/react-router';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants/routes';

const TABS = [{ to: ROUTES.logs, label: 'Explorer', end: true }] as const;

export function LogsNavTabs(): JSX.Element {
  return (
    <nav className="mb-4 flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
      {TABS.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          activeOptions={{
            exact: 'end' in tab ? (tab.end as boolean) : false,
          }}
          activeProps={{
            className: cn(
              'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              'bg-[rgba(77,166,200,0.16)] text-[var(--text-primary)]'
            ),
          }}
          inactiveProps={{
            className: cn(
              'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)]'
            ),
          }}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
