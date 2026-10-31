import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { authApi } from '@/api/auth.api';
import { clearAuthSession, loadAccessToken, setAccessToken } from '@/lib/storage';
import type {
  AuthResponse,
  AuthUser,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
  UpdateProfilePayload,
} from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<AuthUser>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const finalizeAuth = useCallback(async (response: AuthResponse) => {
    if (response.accessToken) {
      await setAccessToken(response.accessToken);
    }
    setUser(response.user);
    return response.user;
  }, []);

  // Bootstrap: restore the persisted token and resolve the current user.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await loadAccessToken();
        if (!token) return;
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        await clearAuthSession();
      } finally {
        if (active) setIsLoading(false);
      }
    })().catch(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => finalizeAuth(await authApi.login(payload)),
    [finalizeAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => finalizeAuth(await authApi.register(payload)),
    [finalizeAuth]
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload) => finalizeAuth(await authApi.googleLogin(payload)),
    [finalizeAuth]
  );

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const updated = await authApi.updateMe(payload);
    setUser(updated);
    return updated;
  }, []);

  const logout = useCallback(() => {
    void authApi.logout().catch(() => undefined);
    void clearAuthSession();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      loginWithGoogle,
      updateProfile,
      logout,
    }),
    [user, isLoading, login, register, loginWithGoogle, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
