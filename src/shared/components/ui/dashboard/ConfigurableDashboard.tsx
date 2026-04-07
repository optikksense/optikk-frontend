import { useMemo } from 'react';

import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelSpec,
  DashboardSectionSpec,
  DashboardTabDocument,
} from '@/types/dashboardConfig';

import { useTeamId } from '@app/store/appStore';

import DashboardPanelGrid from './DashboardPanelGrid';
import DashboardSection from './DashboardSection';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';

interface ConfigurableDashboardProps {
  config: DashboardTabDocument | null;
  dataSources?: DashboardDataSources;
  errors?: Record<string, ApiErrorShape | null>;
  isLoading?: boolean;
  extraContext?: DashboardExtraContext;
}

function sortPanels(panels: DashboardPanelSpec[]): DashboardPanelSpec[] {
  return [...panels].sort((left, right) => {
    if (left.order === right.order) {
      return left.id.localeCompare(right.id);
    }
    return left.order - right.order;
  });
}

function sortSections(sections: DashboardSectionSpec[]): DashboardSectionSpec[] {
  return [...sections].sort((left, right) => {
    if (left.order === right.order) {
      return left.id.localeCompare(right.id);
    }
    return left.order - right.order;
  });
}

export default function ConfigurableDashboard({
  config,
  dataSources = {},
  errors = {},
  isLoading = false,
  extraContext = {},
}: ConfigurableDashboardProps) {
  const selectedTeamId = useTeamId();

  const sortedSections = useMemo(() => sortSections(config?.sections ?? []), [config?.sections]);

  const panelsBySection = useMemo(() => {
    const grouped = new Map<string, DashboardPanelSpec[]>();
    for (const panel of config?.panels ?? []) {
      const sectionId = panel.sectionId ?? '__ungrouped';
      const current = grouped.get(sectionId) ?? [];
      current.push(panel);
      grouped.set(sectionId, current);
    }

    for (const [sectionId, panels] of grouped.entries()) {
      grouped.set(sectionId, sortPanels(panels));
    }

    return grouped;
  }, [config?.panels]);

  if (!config || config.panels.length === 0 || config.sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[var(--space-xs)]">
      {sortedSections.map((section) => {
        const sectionPanels = panelsBySection.get(section.id) ?? [];
        if (sectionPanels.length === 0) {
          return null;
        }

        const storageKey = [
          'dashboard-section',
          selectedTeamId ?? 'no-team',
          config.pageId,
          config.id,
          section.id,
        ].join(':');

        return (
          <DashboardSection key={section.id} section={section} storageKey={storageKey}>
            <DashboardPanelGrid
              panels={sectionPanels}
              dataSources={dataSources}
              errors={errors}
              isLoading={isLoading}
              extraContext={extraContext}
            />
          </DashboardSection>
        );
      })}
    </div>
  );
}
