/**
 * Safely extracts a display message string from an unknown error object,
 * falling back to the provided default string if no message is present.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message?: string }).message;
    if (typeof msg === "string" && msg.length > 0) return msg;
  }
  return fallback;
}
