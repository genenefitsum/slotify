import { clearAuthSession, getAuthToken } from '@/lib/storage';

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000/api';

export class HttpError extends Error {
	status: number;
	details?: unknown;

	constructor(message: string, status: number, details?: unknown) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

const createHeaders = (init?: HeadersInit) => {
	const headers = new Headers(init || {});

	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}

	const token = getAuthToken();

	if (token) {
		headers.set('Authorization', `Bearer ${token}`);
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
			clearAuthSession();
		}

		throw new HttpError(
			payload?.message || 'Request failed.',
			response.status,
			payload?.details
		);
	}

	return payload as T;
};

export const http = {
	get: <T>(path: string) => request<T>(path, { method: 'GET' }),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined,
		}),
};
