import { env } from '@/lib/env';
import { clearAuthSession, getAccessToken } from '@/lib/storage';

const API_BASE_URL = env.apiBaseUrl;

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const getMessageFromValue = (value: unknown): string | null => {
  if (!value) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'object') {
    if ('message' in value && typeof value.message === 'string') return value.message.trim() || null;
    if ('error' in value && typeof value.error === 'string') return value.error.trim() || null;
    if ('detail' in value && typeof value.detail === 'string') return value.detail.trim() || null;
  }
  return null;
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (error instanceof HttpError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return getMessageFromValue(error) || fallback;
};

type PrimitiveQueryValue = string | number | boolean | null | undefined;
type QueryValue = PrimitiveQueryValue | PrimitiveQueryValue[];
type QueryParams = Record<string, QueryValue>;

const stringifyQueryValue = (value: PrimitiveQueryValue): string | null =>
  value === null || value === undefined ? null : String(value);

const buildPathWithQuery = (path: string, query?: QueryParams): string => {
  if (!query) return path;
  const searchParams = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(query)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        const serialized = stringifyQueryValue(value);
        if (serialized !== null) searchParams.append(key, serialized);
      }
      continue;
    }
    const serialized = stringifyQueryValue(rawValue);
    if (serialized !== null) searchParams.set(key, serialized);
  }
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};

const createHeaders = (init?: HeadersInit) => {
  const headers = new Headers(init || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  // Bearer auth: the backend accepts this header and skips CSRF when present,
  // so mobile needs no cookie jar or CSRF token.
  const accessToken = getAccessToken();
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: createHeaders(options.headers),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      void clearAuthSession();
    }
    const message =
      getMessageFromValue(payload) || getMessageFromValue(payload?.details) || 'Request failed.';
    throw new HttpError(message, response.status, payload?.details ?? payload);
  }

  return payload as T;
};

export const http = {
  get: <T>(path: string, query?: QueryParams) =>
    request<T>(buildPathWithQuery(path, query), { method: 'GET' }),
  post: <T>(path: string, body?: unknown, query?: QueryParams) =>
    request<T>(buildPathWithQuery(path, query), {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, query?: QueryParams) =>
    request<T>(buildPathWithQuery(path, query), {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, options?: { body?: unknown; query?: QueryParams }) =>
    request<T>(buildPathWithQuery(path, options?.query), {
      method: 'DELETE',
      body: options?.body ? JSON.stringify(options.body) : undefined,
    }),
};
