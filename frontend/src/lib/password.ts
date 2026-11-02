/**
 * Password policy for any password a user *sets* (register / reset): at least
 * 8 characters with an uppercase letter, a lowercase letter, and a number.
 * Mirrors the backend source of truth (backend/src/validators/shared.js:
 * requirePassword) and the mobile schema (mobile/src/lib/validation.ts).
 */
export const PASSWORD_POLICY_MESSAGE =
	'Use at least 8 characters with an uppercase letter, a lowercase letter, and a number.';

// Native HTML validation hint — mirrors isStrongPassword below.
export const PASSWORD_PATTERN = '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}';

export const isStrongPassword = (password: string): boolean =>
	password.length >= 8 &&
	/[a-z]/.test(password) &&
	/[A-Z]/.test(password) &&
	/[0-9]/.test(password);

/** Returns an error message when the password is too weak, otherwise null. */
export const getPasswordError = (password: string): string | null =>
	isStrongPassword(password) ? null : PASSWORD_POLICY_MESSAGE;
