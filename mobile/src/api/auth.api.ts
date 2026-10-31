import { http } from '@/api/http';
import type {
  AuthResponse,
  AuthUser,
  CurrentUserResponse,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/types/auth';

export const authApi = {
  login: (payload: LoginPayload) => http.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => http.post<AuthResponse>('/auth/register', payload),
  googleLogin: (payload: GoogleLoginPayload) => http.post<AuthResponse>('/auth/google', payload),
  logout: () => http.post<{ success: boolean }>('/auth/logout'),
  me: () => http.get<CurrentUserResponse>('/users/me'),
  updateMe: (payload: UpdateProfilePayload) => http.patch<AuthUser>('/users/me', payload),
};
