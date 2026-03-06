import DashboardPage from '@components/dashboard/DashboardPage';

/**
 * Overview hub — tabs (Summary / Errors / SLO) fully driven by backend YAML config.
 */
export default function OverviewHubPage() {
  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <DashboardPage pageId="overview" />
    </div>
  );
}
