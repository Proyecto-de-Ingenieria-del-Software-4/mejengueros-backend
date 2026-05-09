export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta: ApiMeta;
}

export interface ApiError {
  code: string;
  status: number;
  message: string;
  details?: ApiErrorDetail[];
  metadata?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  code: string;
  target?: string;
  message?: string;
}

export interface ApiMeta {
  timestamp: string;
  path: string;
  method: string;
  requestId: string;
}
