import { http } from '@/api/http';
import type {
	AuthResponse,
	AuthUser,
	GoogleLoginPayload,
	LoginPayload,
	RegisterPayload,
} from '@/types/auth';

export const authApi = {
	login: (payload: LoginPayload) => http.post<AuthResponse>('/auth/login', payload),
	register: (payload: RegisterPayload) => http.post<AuthResponse>('/auth/register', payload),
	googleLogin: (payload: GoogleLoginPayload) =>
		http.post<AuthResponse>('/auth/google', payload),
	me: () => http.get<AuthUser>('/users/me'),
};
