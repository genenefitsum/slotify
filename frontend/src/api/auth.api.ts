import { http } from '@/api/http';
import type {
	AuthResponse,
	CurrentUserResponse,
	ForgotPasswordPayload,
	ForgotPasswordResponse,
	GoogleLoginPayload,
	LoginPayload,
	RegisterPayload,
	ResetPasswordPayload,
	ResetPasswordResponse,
} from '@/types/auth';

export const authApi = {
	login: (payload: LoginPayload) => http.post<AuthResponse>('/auth/login', payload),
	register: (payload: RegisterPayload) => http.post<AuthResponse>('/auth/register', payload),
	googleLogin: (payload: GoogleLoginPayload) =>
		http.post<AuthResponse>('/auth/google', payload),
	logout: () => http.post<{ success: boolean }>('/auth/logout'),
	me: () => http.get<CurrentUserResponse>('/users/me'),
	forgotPassword: (payload: ForgotPasswordPayload) =>
		http.post<ForgotPasswordResponse>('/auth/forgot-password', payload),
	resetPassword: (payload: ResetPasswordPayload) =>
		http.post<ResetPasswordResponse>('/auth/reset-password', payload),
};
