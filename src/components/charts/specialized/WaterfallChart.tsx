import { useState, useMemo } from 'react';

import { formatDuration } from '@utils/formatters';

import { CHART_COLORS, STATUS_COLORS } from '@config/constants';
import './WaterfallChart.css';

/**
 * WaterfallChart - Displays trace spans in a waterfall/timeline view
 * @param spans.spans
 * @param spans - Array of span objects with span_id, parent_span_id, operation_name, etc.
 * @param onSpanClick - Callback when a span bar is clicked
 * @param selectedSpanId - Currently selected span ID
 * @param spans.onSpanClick
 * @param spans.selectedSpanId
 */
export default function WaterfallChart({ spans = [], onSpanClick, selectedSpanId }: any) {
  const [hoveredSpanId, setHoveredSpanId] = useState<string | null>(null);

  // Build span tree and calculate depths
  const { spanTree, traceStart, traceDuration } = useMemo(() => {
    if (!spans || spans.length === 0) {
      return { spanTree: [], traceStart: 0, traceEnd: 0, traceDuration: 0 };
    }

    // Calculate trace time boundaries
    const startTimes = (spans as any[]).map((s) => new Date(s.start_time).getTime());
    const endTimes = (spans as any[]).map((s) => new Date(s.end_time).getTime());
    const traceStart = Math.min(...startTimes);
    const traceEnd = Math.max(...endTimes);
    const traceDuration = traceEnd - traceStart;

    // Build parent-child map
    const childrenMap: Record<string, string[]> = {};
    const spanMap: Record<string, any> = {};

    (spans as any[]).forEach((span) => {
      spanMap[span.span_id] = span;
      if (!childrenMap[span.span_id]) {
        childrenMap[span.span_id] = [];
      }
    });

    (spans as any[]).forEach((span) => {
      if (span.parent_span_id) {
        if (!childrenMap[span.parent_span_id]) {
          childrenMap[span.parent_span_id] = [];
        }
        childrenMap[span.parent_span_id].push(span.span_id);
      }
    });

    // Find root spans (no parent or parent not in this trace)
    const roots = (spans as any[]).filter((s) => !s.parent_span_id || !spanMap[s.parent_span_id]);

    // Build tree with depths using DFS
    const tree: any[] = [];
    const visited = new Set();

    const dfs = (spanId: string, depth: number) => {
      if (visited.has(spanId)) return;
      visited.add(spanId);

      const span = spanMap[spanId];
      if (!span) return;

      tree.push({ ...span, depth });

      // Visit children sorted by start time
      const children = childrenMap[spanId] || [];
      children
        .map((id) => spanMap[id])
        .filter(Boolean)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .forEach((child) => dfs(child.span_id, depth + 1));
    };

    // Process all root spans
    roots
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .forEach((root) => dfs(root.span_id, 0));

    return { spanTree: tree, traceStart, traceEnd, traceDuration };
  }, [spans]);

  // Get color for service
  const getServiceColor = (serviceName: string, status: string) => {
    if (status === 'ERROR') {
      return STATUS_COLORS.ERROR;
    }
    // Hash service name to get consistent color
    const hash = serviceName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CHART_COLORS[hash % CHART_COLORS.length];
  };

  // Calculate bar position and width
  const getBarStyle = (span: any, index: number) => {
    const startTime = new Date(span.start_time).getTime();
    const endTime = new Date(span.end_time).getTime();
    const leftPercent = traceDuration > 0 ? ((startTime - traceStart) / traceDuration) * 100 : 0;
    const widthPercent = traceDuration > 0 ? ((endTime - startTime) / traceDuration) * 100 : 0;

    const baseColor = getServiceColor(span.service_name || 'unknown', span.status);
    let backgroundStr = baseColor;
    if (baseColor.startsWith('#')) {
      backgroundStr = `linear-gradient(90deg, ${baseColor}, ${baseColor}dd)`;
    }

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 0.5)}%`,
      background: backgroundStr,
      animationDelay: `${Math.min(index * 0.05, 1.5)}s`,
    };
  };

  const getTimeAxisLabels = () => {
    const labels = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const timeMs = (traceDuration * i) / steps;
      labels.push(formatDuration(timeMs));
    }
    return labels;
  };

  if (!spans || spans.length === 0) {
    return (
      <div className="waterfall-empty">
        No spans available
      </div>
    );
  }

  const timeLabels = getTimeAxisLabels();

  return (
    <div className="waterfall-chart">
      <div className="waterfall-header">
        <div className="waterfall-labels-column">
          <span className="waterfall-header-title">Span</span>
        </div>
        <div className="waterfall-timeline-column">
          <div className="waterfall-time-axis">
            {timeLabels.map((label, idx) => (
              <span key={idx} className="waterfall-time-label">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="waterfall-body">
        {spanTree.map((span) => (
          <div
            key={span.span_id}
            className={`waterfall-row ${selectedSpanId === span.span_id ? 'selected' : ''} ${hoveredSpanId === span.span_id ? 'hovered' : ''
              }`}
            onClick={() => onSpanClick && onSpanClick(span)}
            onMouseEnter={() => setHoveredSpanId(span.span_id)}
            onMouseLeave={() => setHoveredSpanId(null)}
          >
            <div className="waterfall-labels-column">
              <div
                className="waterfall-span-label"
                style={{ paddingLeft: `${span.depth * 20 + 8}px` }}
              >
                <span className="waterfall-service-name">{span.service_name}</span>
                <span className="waterfall-operation-name">{span.operation_name}</span>
              </div>
            </div>

            <div className="waterfall-timeline-column">
              <div className="waterfall-bar-container">
                <div
                  className="waterfall-bar"
                  style={getBarStyle(span, spanTree.indexOf(span))}
                  title={`${span.operation_name} - ${formatDuration(span.duration_ms)}`}
                >
                  <span className="waterfall-bar-duration">
                    {formatDuration(span.duration_ms)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
