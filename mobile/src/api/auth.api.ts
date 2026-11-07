import { http } from '@/api/http';
import type {
  AuthResponse,
  AuthUser,
  CurrentUserResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  UpdateProfilePayload,
} from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) => http.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => http.post<AuthResponse>('/auth/register', payload),
  googleLogin: (payload: GoogleLoginPayload) => http.post<AuthResponse>('/auth/google', payload),
  logout: () => http.post<{ success: boolean }>('/auth/logout'),
  me: () => http.get<CurrentUserResponse>('/users/me'),
  updateMe: (payload: UpdateProfilePayload) => http.patch<AuthUser>('/users/me', payload),
  forgotPassword: (payload: ForgotPasswordPayload) =>
    http.post<ForgotPasswordResponse>('/auth/forgot-password', payload),
  resetPassword: (payload: ResetPasswordPayload) =>
    http.post<ResetPasswordResponse>('/auth/reset-password', payload),
  registerPushToken: (token: string) =>
    http.post<{ success: boolean }>('/users/me/push-token', { token }),
  unregisterPushToken: (token: string) =>
    http.delete<{ success: boolean }>('/users/me/push-token', { body: { token } }),
};
