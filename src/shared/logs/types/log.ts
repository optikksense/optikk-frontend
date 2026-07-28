   
                                                                          
                                                                              
                                                                             
                                                        
   
export interface LogRecord {
  readonly id: string;
  readonly timestamp: string;
  readonly observedTimestamp?: string;
  readonly serviceName: string;
  readonly severityText?: string;
  readonly severityBucket: number;
  readonly body: string;
  readonly host?: string;
  readonly pod?: string;
  readonly container?: string;
  readonly environment?: string;
  readonly scopeName?: string;
  readonly scopeVersion?: string;
  readonly traceId?: string;
  readonly spanId?: string;
  readonly attributesString?: Readonly<Record<string, string>>;
  readonly attributesNumber?: Readonly<Record<string, number>>;
  readonly attributesBool?: Readonly<Record<string, boolean>>;
  readonly resource?: Readonly<Record<string, unknown>>;
}

type LogCursor = string;

export interface LogsQueryResponse {
  readonly results: readonly LogRecord[];
  readonly cursor?: LogCursor;
  readonly hasMore: boolean;
}

export interface LogsGetByIdResponse {
  readonly log: LogRecord;
}
