import LogsPage from './LogsPage';

export default function LogsHubPage() {
  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <LogsPage />
    </div>
  );
}
