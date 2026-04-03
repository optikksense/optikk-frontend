import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui';

import type { ServiceGraphNode, ServiceGraphEdge } from '@shared/components/ui/charts/specialized/ServiceGraph';

function formatMs(ms: number): string {
  if (ms >= 1_000) return `${(ms / 1_000).toFixed(2)}s`;
  return `${ms.toFixed(1)}ms`;
}

interface TopologyDetailPanelProps {
  selectedNode: ServiceGraphNode | null;
  selectedEdge: ServiceGraphEdge | null;
  onClose: () => void;
}

export default function TopologyDetailPanel({
  selectedNode,
  selectedEdge,
  onClose,
}: TopologyDetailPanelProps) {
  const navigate = useNavigate();

  if (!selectedNode && !selectedEdge) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-[rgba(95,106,133,0.45)] bg-[rgba(15,18,25,0.96)] px-5 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {selectedNode && (
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {selectedNode.name}
              </div>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                {selectedNode.status}
              </div>
            </div>
            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Requests: </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {selectedNode.requestCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Error Rate: </span>
                <span
                  className={`font-mono ${
                    selectedNode.errorRate > 5
                      ? 'text-red-400'
                      : selectedNode.errorRate > 1
                        ? 'text-yellow-400'
                        : 'text-green-400'
                  }`}
                >
                  {selectedNode.errorRate.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Latency: </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatMs(selectedNode.avgLatency)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(`/services/${encodeURIComponent(selectedNode.name)}`)
                }
              >
                View Service
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(
                    `/traces?service=${encodeURIComponent(selectedNode.name)}`
                  )
                }
              >
                View Traces
              </Button>
            </div>
          </div>
        )}

        {selectedEdge && !selectedNode && (
          <div className="flex items-center gap-6">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {selectedEdge.source} → {selectedEdge.target}
              </div>
            </div>
            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-[var(--text-muted)]">Calls: </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {selectedEdge.callCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Error Rate: </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {selectedEdge.errorRate.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">P95: </span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatMs(selectedEdge.p95LatencyMs)}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="ml-4 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
