import type React from "react";
import type { ReactNode } from "react";

interface EntityExplorerLayoutProps {
  header: ReactNode;
  kpiRow?: ReactNode;
  chartsRow?: ReactNode;
  tabPanel?: ReactNode;
  tableSection: ReactNode;
  detailSidebar?: ReactNode;
  className?: string;
}

/**
 * Standardized layout for observability exploration pages (Logs, Traces, Metrics).
 * Follows the pattern: Header -> KPI -> Charts -> TabPanel (optional) -> Main Table Section -> Detail Sidebar (optional).
 */
export const EntityExplorerLayout: React.FC<EntityExplorerLayoutProps> = ({
  header,
  kpiRow,
  chartsRow,
  tabPanel,
  tableSection,
  detailSidebar,
  className = "",
}) => {
  return (
    <div className={`explorer-layout ${className}`}>
      {header}

      {kpiRow && <div className="explorer-layout__kpi-section">{kpiRow}</div>}

      {chartsRow && <div className="explorer-layout__charts-section">{chartsRow}</div>}

      {tabPanel && (
        <div className="explorer-layout__tabs-section" style={{ marginBottom: 16 }}>
          {tabPanel}
        </div>
      )}

      <div className="explorer-layout__table-section">{tableSection}</div>

      {detailSidebar}
    </div>
  );
};
