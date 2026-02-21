import { Bar } from 'react-chartjs-2';
import { createChartOptions } from '@utils/chartHelpers';
import { LOG_LEVELS } from '@config/constants';

// Level → dataset order (bottom to top in stacked bar)
const LEVEL_ORDER = ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

export default function LogHistogram({ data = [], height = 80, onBrush }) {
  if (!data || data.length === 0) return null;

  // data can be flat [{timestamp, count}] or level-split [{timestamp, level, count}]
  const hasLevels = data.some((d) => d.level);

  let labels;
  let datasets;

  if (hasLevels) {
    // Group by timestamp bucket
    const buckets = {};
    data.forEach((d) => {
      const key = d.time_bucket || d.timestamp;
      if (!buckets[key]) buckets[key] = {};
      buckets[key][String(d.level).toUpperCase()] = (buckets[key][String(d.level).toUpperCase()] || 0) + Number(d.count || 0);
    });

    const sortedKeys = Object.keys(buckets).sort();
    labels = sortedKeys.map((k) => {
      const date = new Date(k);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    datasets = LEVEL_ORDER.map((level) => {
      const cfg = LOG_LEVELS[level] || { color: '#98A2B3', label: level };
      return {
        label: cfg.label,
        data: sortedKeys.map((k) => buckets[k][level] || 0),
        backgroundColor: cfg.color + 'CC',
        borderColor: cfg.color,
        borderWidth: 0,
        borderRadius: 0,
        stack: 'logs',
      };
    });
  } else {
    // Flat: single purple bar per bucket
    const sorted = [...data].sort((a, b) =>
      new Date(a.time_bucket || a.timestamp) - new Date(b.time_bucket || b.timestamp)
    );
    labels = sorted.map((d) => {
      const date = new Date(d.time_bucket || d.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    datasets = [
      {
        label: 'Logs',
        data: sorted.map((d) => d.count || d.value || 0),
        backgroundColor: '#5E60CECC',
        borderColor: '#5E60CE',
        borderWidth: 0,
        borderRadius: 0,
        stack: 'logs',
      },
    ];
  }

  const options = createChartOptions({
    layout: {
      padding: { top: 5, bottom: 30 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        yAlign: 'bottom',
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#555', maxTicksLimit: 10, maxRotation: 0, font: { size: 10 } },
        border: { color: '#2D2D2D' },
      },
      y: {
        stacked: true,
        grid: { color: '#1E1E1E' },
        ticks: { color: '#555', maxTicksLimit: 3, font: { size: 10 } },
        beginAtZero: true,
        border: { color: '#2D2D2D' },
      },
    },
    onClick: onBrush ? (_, elements) => {
      if (elements.length > 0) onBrush(elements[0].index);
    } : undefined,
  });

  return (
    <div style={{ height }}>
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  );
}
