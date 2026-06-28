const CSRF_COOKIE_NAME = 'slotify_csrf_token';

let storedCsrfToken: string | null = null;

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

export const clearAuthSession = () => {
	storedCsrfToken = null;
};
