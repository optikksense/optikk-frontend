const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function interpolateTemplate(template: string, values: Record<string, unknown>): string {
  return template.replace(PLACEHOLDER_PATTERN, (_match, key: string) => {
    const value = values[key];
    return value == null ? `{${key}}` : String(value);
  });
}

export function interpolateValue<T>(value: T, values: Record<string, unknown>): T {
  if (typeof value === "string") {
    return interpolateTemplate(value, values) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, values)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, interpolateValue(entryValue, values)])
    ) as T;
  }

  return value;
}

export function hasUnresolvedPlaceholders(value: string): boolean {
  return /\{\w+\}/.test(value);
}

export function buildInterpolatedPath(
  template: string | undefined,
  values: Record<string, unknown>
): string | null {
  if (!template) {
    return null;
  }

  const resolved = interpolateTemplate(template, values);
  return hasUnresolvedPlaceholders(resolved) ? null : resolved;
}
