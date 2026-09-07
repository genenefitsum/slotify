const CSRF_COOKIE_NAME = 'slotify_csrf_token';
const ACCESS_TOKEN_STORAGE_KEY = 'slotify_access_token';

let storedCsrfToken: string | null = null;
let storedAccessToken: string | null = null;

const getCookieFromDocument = (cookieName: string) => {
	if (typeof document === 'undefined') {
		return null;
	}

	const cookiePrefix = `${encodeURIComponent(cookieName)}=`;
	const matches = document.cookie.split('; ').find((entry) => entry.startsWith(cookiePrefix));

	if (!matches) {
		return null;
	}

	return decodeURIComponent(matches.slice(cookiePrefix.length));
};

export const setCsrfToken = (token: string | null) => {
	storedCsrfToken = token;
};

export const getCsrfToken = () => storedCsrfToken || getCookieFromDocument(CSRF_COOKIE_NAME);

export const setAccessToken = (token: string | null) => {
	storedAccessToken = token;
	if (typeof window !== 'undefined') {
		if (token) {
			localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
		} else {
			localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
		}
	}
};

export const getAccessToken = (): string | null => {
	if (storedAccessToken) {
		return storedAccessToken;
	}

	if (typeof window !== 'undefined') {
		const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
		if (token) {
			storedAccessToken = token;
			return token;
		}
	}

	return null;
};

export const clearAuthSession = () => {
	storedCsrfToken = null;
	storedAccessToken = null;
	if (typeof window !== 'undefined') {
		localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
	}
};
