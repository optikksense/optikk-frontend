import { z } from "zod";
import * as fs from "fs";

export const logEntrySchema = z.object({
  id: z.string().brand<'LogId'>(),
  timestamp: z.union([z.string(), z.number()]),
  severityText: z.string().optional(),
  body: z.string().optional(),
  serviceName: z.string().optional(),
  level: z.string().optional(),
  message: z.string().optional(),
  service: z.string().optional(),
  service_name: z.string().optional(),
}).passthrough();

function normalizeLog(raw: any) {
  return {
    ...raw,
    level: raw.level ?? raw.severityText ?? '',
    message: raw.message ?? raw.body ?? '',
    service: raw.service ?? raw.serviceName ?? raw.service_name ?? '',
  };
}

const payload = JSON.parse(fs.readFileSync("/tmp/logs_response.json", "utf-8"));

console.log("Input Logs Length:", payload.data.logs.length);

try {
  const parsedLogs = z.array(logEntrySchema).parse(payload.data.logs || []);
  console.log("Parsed Logs Length:", parsedLogs.length);
  
  const normalizedLogs = parsedLogs.map(normalizeLog);
  console.log("Normalized Logs Length:", normalizedLogs.length);
  
  console.log("Sample Result:");
  console.log(normalizedLogs[0]);
} catch (e) {
  console.error("Zod Parse Failed:");
  console.error(JSON.stringify((e as any).issues, null, 2));
}
