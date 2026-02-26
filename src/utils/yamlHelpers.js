import yaml from 'js-yaml';

const ROW_HEIGHT = 70;
const COLS = 24;
const DEFAULT_CHART_HEIGHT = 280;

/**
 * Convert a parsed config JS object to a YAML string.
 * Strips internal grid position fields (_gridX, _gridY) before serialization.
 */
export function configToYaml(configObj) {
  const clean = structuredClone(configObj);
  if (clean.charts) {
    for (const chart of clean.charts) {
      delete chart._gridX;
      delete chart._gridY;
      // Remove layout.row if it matches default
      if (chart.layout?.row) delete chart.layout.row;
    }
  }
  return yaml.dump(clean, { lineWidth: -1, noRefs: true, sortKeys: false });
}

/**
 * Parse a YAML string into a config JS object.
 */
export function yamlToConfig(yamlStr) {
  return yaml.load(yamlStr);
}

/**
 * Convert a config's charts array into react-grid-layout layout items.
 * Each chart gets a position computed from its order and col width.
 */
export function configToGridLayout(config) {
  if (!config?.charts) return [];

  const layout = [];
  let currentX = 0;
  let currentY = 0;
  let maxRowH = 0;

  for (const chart of config.charts) {
    const w = chart.layout?.col || 12;
    const h = chart.layout?.row || Math.max(4, Math.ceil((chart.height || DEFAULT_CHART_HEIGHT) / ROW_HEIGHT));

    // Wrap to next row if current panel doesn't fit
    if (currentX + w > COLS) {
      currentX = 0;
      currentY += maxRowH;
      maxRowH = 0;
    }

    layout.push({
      i: chart.id,
      x: chart._gridX ?? currentX,
      y: chart._gridY ?? currentY,
      w,
      h,
      minW: 6,
      minH: 3,
    });

    currentX += w;
    maxRowH = Math.max(maxRowH, h);
  }

  return layout;
}

/**
 * Apply react-grid-layout positions back to a config object.
 * Reorders charts by (y, x) and updates layout.col.
 */
export function applyLayoutToConfig(config, layoutItems) {
  if (!config?.charts) return config;

  const posMap = {};
  for (const item of layoutItems) {
    posMap[item.i] = { x: item.x, y: item.y, w: item.w, h: item.h };
  }

  const updated = structuredClone(config);
  for (const chart of updated.charts) {
    const pos = posMap[chart.id];
    if (pos) {
      if (!chart.layout) chart.layout = {};
      chart.layout.col = pos.w;
      chart._gridX = pos.x;
      chart._gridY = pos.y;
    }
  }

  // Sort by grid position (top-to-bottom, left-to-right)
  updated.charts.sort((a, b) => {
    const ay = a._gridY ?? 0;
    const by = b._gridY ?? 0;
    if (ay !== by) return ay - by;
    return (a._gridX ?? 0) - (b._gridX ?? 0);
  });

  return updated;
}

/**
 * Generate a unique panel ID.
 */
export function generatePanelId() {
  return `panel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Create a default empty panel config.
 */
export function createEmptyPanel() {
  return {
    id: generatePanelId(),
    title: 'New Panel',
    type: 'request',
    layout: { col: 12 },
    dataSource: '',
    valueKey: '',
    height: DEFAULT_CHART_HEIGHT,
  };
}
