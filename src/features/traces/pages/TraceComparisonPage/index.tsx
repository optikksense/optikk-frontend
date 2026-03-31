import { GitCompare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button, Skeleton } from '@/components/ui';
import { PageHeader, PageShell, PageSurface } from '@shared/components/ui';
import { tracesService } from '@shared/api/tracesService';

import TraceComparisonView from '../../components/TraceComparisonView';

export default function TraceComparisonPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const traceA = searchParams.get('a') ?? '';
  const traceB = searchParams.get('b') ?? '';

  const comparisonQuery = useQuery({
    queryKey: ['trace-comparison', traceA, traceB],
    queryFn: () => tracesService.getTraceComparison(traceA, traceB),
    enabled: traceA.length > 0 && traceB.length > 0,
  });

  return (
    <PageShell>
      <PageHeader
        title="Trace Comparison"
        icon={<GitCompare size={22} />}
        subtitle="Compare structure, service deltas, and latency movement across two traces without leaving the traces workflow."
        breadcrumbs={[{ label: 'Traces', path: '/traces' }, { label: 'Compare' }]}
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/traces')}>
            Back to Traces
          </Button>
        }
      />

      {!traceA || !traceB ? (
        <PageSurface className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Select exactly two traces from the explorer to compare them here.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/traces')}>
              Open Trace Explorer
            </Button>
          </div>
        </PageSurface>
      ) : comparisonQuery.isLoading ? (
        <PageSurface>
          <Skeleton count={4} />
        </PageSurface>
      ) : comparisonQuery.isError ? (
        <PageSurface className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-error)]">
            Unable to load comparison data.
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            The traces endpoint did not return a usable comparison payload for these IDs.
          </p>
        </PageSurface>
      ) : comparisonQuery.data ? (
        <TraceComparisonView comparison={comparisonQuery.data} />
      ) : null}
    </PageShell>
  );
}
