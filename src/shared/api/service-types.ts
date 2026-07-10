export type RequestTime = string | number;

export interface PageInfo {
  readonly hasMore: boolean;
  readonly nextCursor?: string;
  readonly limit: number;
}

export interface PaginatedResponse<T> {
  readonly results: T;
  readonly pageInfo: PageInfo;
}
