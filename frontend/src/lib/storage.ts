import type { AuthUser } from '@/types/auth';

const TOKEN_KEY = 'slotify_token';
const USER_KEY = 'slotify_user';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token: string) => {
	localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
	localStorage.removeItem(TOKEN_KEY);
};

export const getStoredUser = (): AuthUser | null => {
	const raw = localStorage.getItem(USER_KEY);

	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as AuthUser;
	} catch {
		localStorage.removeItem(USER_KEY);
		return null;
	}
};

export const setStoredUser = (user: AuthUser) => {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
	localStorage.removeItem(USER_KEY);
};

export const clearAuthSession = () => {
	clearAuthToken();
	clearStoredUser();
};
