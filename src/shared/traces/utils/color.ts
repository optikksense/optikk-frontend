const PALETTE_HUES = [222, 32, 268, 174, 112, 8, 296, 56, 198, 332];

/**
 * Calculates a deterministic color hue (0-360) for a service name.
 */
export function svcHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return PALETTE_HUES[Math.abs(h) % PALETTE_HUES.length];
}
