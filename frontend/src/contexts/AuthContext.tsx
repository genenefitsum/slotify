/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { authApi } from '@/api/auth.api';
import { HttpError } from '@/api/http';
import {
  clearAuthSession,
  setAccessToken,
  setCsrfToken,
} from '@/lib/storage';
import type {
  AuthResponse,
  AuthUser,
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
} from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const finalizeAuth = useCallback((response: AuthResponse) => {
    if (response.accessToken) {
      setAccessToken(response.accessToken);
    }
    if (response.csrfToken) {
      setCsrfToken(response.csrfToken);
    }
    setUser(response.user);
    return response.user;
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      return finalizeAuth(response);
    },
    [finalizeAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      return finalizeAuth(response);
    },
    [finalizeAuth]
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload) => {
      const response = await authApi.googleLogin(payload);
      return finalizeAuth(response);
    },
    [finalizeAuth]
  );

  const logout = useCallback(() => {
    void authApi.logout().catch(() => undefined);
    clearAuthSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const profile = await authApi.me();
        if (profile.csrfToken) {
          setCsrfToken(profile.csrfToken);
        }
        setUser(profile);
      } catch (error) {
        if (error instanceof HttpError && error.status === 401) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void hydrateSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
    }),
    [isLoading, login, loginWithGoogle, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
};
