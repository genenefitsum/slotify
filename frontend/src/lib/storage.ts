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

export const getCsrfToken = () => getCookieFromDocument('slotify_csrf_token');

export const clearAuthSession = () => {
	// Session cookies are cleared by the backend logout endpoint.
};
