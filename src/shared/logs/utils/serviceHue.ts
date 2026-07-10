/**
 * Service → OKLCH hue map. Used by the swatch dot in the log table and
 * detail panel so each service has a stable, recognizable color across
 * the Logs Explorer and (eventually) the Trace Detail page.
 *
 * Curated hues come from the design handoff; unknown services fall back
 * to a deterministic FNV-1a hash of the name.
 */

const CURATED: Readonly<Record<string, number>> = {
  "web-bff": 212,
  "auth-svc": 268,
  "cart-svc": 174,
  "inventory-svc": 142,
  "pricing-svc": 88,
  "payment-svc": 32,
  "fraud-detection": 348,
  "order-svc": 312,
  "notification-svc": 240,
  redis: 8,
  postgres: 200,
  "stripe.com": 50,
  kafka: 0,
};

function fnv1aHue(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 360;
}

function serviceHue(name: string | null | undefined): number {
  if (!name) return 270;
  const curated = CURATED[name];
  if (curated != null) return curated;
  return fnv1aHue(name);
}

export function serviceSwatchColor(name: string | null | undefined): string {
  return `oklch(0.68 0.14 ${serviceHue(name)})`;
}
