   
                                                                          
                                                                           
                                       
   
export function tryParseJson(text: string): Record<string, unknown> | unknown[] | null {
  const trimmed = text.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as Record<string, unknown> | unknown[];
      }
    } catch {}
  }
  return null;
}
