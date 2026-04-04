import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { DetailDrawer } from '@shared/components/ui/layout';

import { clearDashboardDrawerSearch, readDashboardDrawerState } from './utils/dashboardDrawerState';

const ENTITY_LABELS: Record<string, string> = {
  aiModel: 'AI Model',
  databaseSystem: 'Database System',
  errorGroup: 'Error Group',
  kafkaGroup: 'Kafka Consumer Group',
  kafkaTopic: 'Kafka Topic',
  node: 'Node',
  redisInstance: 'Redis Instance',
};

function toFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\bDb\b/g, 'DB')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bHttp\b/g, 'HTTP')
    .replace(/\bP95\b/g, 'P95')
    .replace(/\bP99\b/g, 'P99')
    .replace(/\bRss\b/g, 'RSS')
    .replace(/\bVms\b/g, 'VMS');
}

export default function DashboardEntityDrawer(): JSX.Element | null {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const drawer = useMemo(() => readDashboardDrawerState(searchParams), [searchParams]);
  const isOpen = Boolean(drawer.entity && drawer.id);

  const drawerData = useMemo<Record<string, unknown>>(() => {
    if (!drawer.entity || !drawer.id) {
      return {};
    }

    return {
      entity: ENTITY_LABELS[drawer.entity] ?? drawer.entity,
      identifier: drawer.id,
      ...(drawer.data ?? {}),
    };
  }, [drawer.data, drawer.entity, drawer.id]);

  const sections = useMemo(() => {
    const primaryFields = [
      { label: 'Entity', key: 'entity' },
      { label: 'Identifier', key: 'identifier' },
    ];

    const extraFields = Object.keys(drawerData)
      .filter((key) => key !== 'entity' && key !== 'identifier')
      .sort((left, right) => left.localeCompare(right))
      .map((key) => ({
        label: toFieldLabel(key),
        key,
      }));

    return [
      { title: 'Selection', fields: primaryFields },
      ...(extraFields.length > 0 ? [{ title: 'Context', fields: extraFields }] : []),
    ];
  }, [drawerData]);

  if (!isOpen) {
    return null;
  }

  return (
    <DetailDrawer
      open
      onClose={() =>
        navigate(
          {
            pathname: location.pathname,
            search: clearDashboardDrawerSearch(location.search),
          },
          { replace: true }
        )
      }
      title={
        drawer.title || (drawer.entity ? (ENTITY_LABELS[drawer.entity] ?? 'Details') : 'Details')
      }
      data={drawerData}
      sections={sections}
      extra={
        !drawer.data ? (
          <p className="text-sm text-[var(--text-secondary)]">
            This detail view was opened from a legacy link, so only the identifier is available
            until the parent dashboard is opened from a live row selection.
          </p>
        ) : null
      }
    />
  );
}
