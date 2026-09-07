export type UserRole = 'customer' | 'vendor_owner' | 'vendor_staff' | 'admin';

export type AuthUser = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	status: 'active' | 'suspended' | 'disabled';
};

export type AuthResponse = {
	user: AuthUser;
	accessToken?: string;
	csrfToken?: string;
};

export type CurrentUserResponse = AuthUser & {
	csrfToken?: string;
};

export type LoginPayload = {
	email: string;
	password: string;
};

export type RegisterPayload = {
	email: string;
	phone?: string;
	password: string;
	firstName: string;
	lastName?: string;
	role: 'customer' | 'vendor_owner';
};

export type GoogleLoginPayload = {
	credential: string;
	role?: 'customer' | 'vendor_owner';
};
