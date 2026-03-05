export interface ApiError {
    message: string;
    code?: string;
    [key: string]: unknown;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: ApiError;
}

export interface User {
    id: string;
    email: string;
    name?: string;
    teams: Team[];
    [key: string]: unknown;
}

export interface Team {
    id: number;
    name: string;
    [key: string]: unknown;
}

export interface TimeRange {
    label: string;
    value: string;
    minutes?: number;
    start?: number;
    end?: number;
    startTime?: string;
    endTime?: string;
}

export interface MetricData {
    timestamp: string;
    value: number;
    [key: string]: unknown;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    level: string;
    message: string;
    service: string;
    [key: string]: unknown;
}

export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    serviceName: string;
    timestamp: number;
    duration: number;
    status: string;
    [key: string]: unknown;
}
