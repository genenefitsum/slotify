export type UserRole = 'customer' | 'vendor_owner' | 'vendor_staff' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'disabled';

export type AuthProvider = 'local' | 'google';

export type UserProfile = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	status: UserStatus;
};

export type PublicUser = UserProfile;
