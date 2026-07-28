export interface StackFrame {
  method: string;
  file: string;
}

   
                                                                                                            
   
export function parseStackFrames(stacktrace?: string, limit = 4): StackFrame[] {
  if (!stacktrace) return [];

  return stacktrace
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, limit)
    .map((line) => {
      const rubyMatch = line.match(/(.+):(\d+):in `(.+)'/);
      if (rubyMatch) {
        return {
          method: rubyMatch[3] ?? "unknown",
          file: `${rubyMatch[1]}:${rubyMatch[2]}`,
        };
      }
      const generalMatch = line.match(/at\s+(.+)\s+\((.+):(\d+)\)/);
      if (generalMatch) {
        return {
          method: generalMatch[1] ?? "unknown",
          file: `${generalMatch[2]}:${generalMatch[3]}`,
        };
      }
      return {
        method: line,
        file: "",
      };
    });
}
