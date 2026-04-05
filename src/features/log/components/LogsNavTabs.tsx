import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import { ROUTES } from '@/shared/constants/routes';

const TABS = [{ to: ROUTES.logs, label: 'Explorer', end: true }] as const;

export function LogsNavTabs(): JSX.Element {
  return (
    <nav className="mb-4 flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-3">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={'end' in tab ? tab.end : false}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              isActive
                ? 'bg-[rgba(77,166,200,0.16)] text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.04)] hover:text-[var(--text-primary)]'
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
