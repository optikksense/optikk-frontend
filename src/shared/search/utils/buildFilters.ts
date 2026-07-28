   
                                                                           
                                                         
                                                                         
                  
   
import type { ExplorerFilter, TranslationWarning } from "../types/filters";

                                                                        

                                                                             
export const ATTR_OPS = new Set([
  "eq",
  "neq",
  "contains",
  "regex",
  "gt",
  "gte",
  "lt",
  "lte",
  "exists",
  "not_exists",
] as const);

                           

                                                                        
export function splitInList(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

                                                                    
export function listValues(op: string, value: string): string[] {
  if (op !== "in" && op !== "not_in") return [value];
  return splitInList(value);
}

                                                                                    
export function appendArr<T extends object>(body: T, key: keyof T, values: string[]): void {
  const current = body[key as keyof typeof body];
  const list = Array.isArray(current) ? (current as string[]) : [];
  Object.assign(body, { [key]: [...list, ...values] });
}

                                          
export function pushUnsupportedOp(
  warnings: TranslationWarning[],
  field: string,
  op: string,
  hint: string
): void {
  warnings.push({
    code: "unsupported_op",
    field,
    message: `Operator "${op}" not supported on "${field}" — ${hint}.`,
  });
}

                                                                
export function pushUnknownField(
  warnings: TranslationWarning[],
  field: string,
  context: string
): void {
  warnings.push({
    code: "unknown_field",
    field,
    message: `Field "${field}" is not a known ${context} field — ignored. Use @${field} for custom attributes.`,
  });
}

   
                                                                       
                                                      
   
export function handleAttribute<
  T extends { attributes?: Array<{ key: string; op?: string; value: string }> },
>(field: string, op: string, value: string, body: T, warnings: TranslationWarning[]): void {
  if (!ATTR_OPS.has(op as never)) {
    pushUnsupportedOp(warnings, field, op, "supported: eq/neq/contains/regex/comparisons/exists");
    return;
  }
  body.attributes = body.attributes ?? [];
  body.attributes.push({ key: field.slice(1), op, value });
}

   
                                                                               
   
export function handleListField<T extends object>(
  field: string,
  op: string,
  value: string,
  body: T,
  warnings: TranslationWarning[],
  mapping: { include: keyof T; exclude?: keyof T }
): void {
  const values = listValues(op, value);
  if (op === "eq" || op === "in") {
    appendArr(body, mapping.include, values);
    return;
  }
  if ((op === "neq" || op === "not_in") && mapping.exclude) {
    appendArr(body, mapping.exclude, values);
    return;
  }
  pushUnsupportedOp(warnings, field, op, "only match / any-of supported");
}

   
                                                                              
   
export function handleSingleValue<T extends object>(
  body: T,
  key: keyof T & string,
  value: string,
  warnings: TranslationWarning[]
): void {
  if (body[key as keyof typeof body]) {
    warnings.push({
      code: "duplicate_single_value",
      field: key,
      message: `Multiple ${key} filters — only the first applies.`,
    });
    return;
  }
  Object.assign(body, { [key]: value });
}

   
                                                                     
   
export function finalizeSearch<T extends { search?: string }>(
  body: T,
  searchTerms: string[]
): void {
  if (searchTerms.length > 0) {
    body.search = searchTerms.join(" ");
  }
}

                         

export interface BuildExtras {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface BuildResult<TBody> {
  readonly body: TBody;
  readonly warnings: readonly TranslationWarning[];
}

   
                                                                          
   
export function initBody<
  T extends { startTime: number; endTime: number; limit?: number; cursor?: string },
>(startTime: number, endTime: number, extras: BuildExtras = {}): T {
  const body = { startTime, endTime } as T;
  if (extras.limit !== undefined) (body as Record<string, unknown>).limit = extras.limit;
  if (extras.cursor) (body as Record<string, unknown>).cursor = extras.cursor;
  return body;
}

   
                                                                  
                                                       
                                                                            
   
export function dispatchCommonFilter<
  T extends { attributes?: Array<{ key: string; op?: string; value: string }> },
>(filter: ExplorerFilter, body: T, warnings: TranslationWarning[], searchTerms: string[]): boolean {
  const { field, op, value } = filter;

                            
  if (field.startsWith("@")) {
    handleAttribute(field, op, value, body, warnings);
    return true;
  }

                        
  if (field === "search" || field === "body") {
    if (op === "contains" || op === "eq") {
      searchTerms.push(value);
    } else {
      pushUnsupportedOp(warnings, field, op, "only contains/eq supported");
    }
    return true;
  }

  return false;
}
