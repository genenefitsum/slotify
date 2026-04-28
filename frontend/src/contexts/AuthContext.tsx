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
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const finalizeAuth = useCallback((response: AuthResponse) => {
    setUser(response.user);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      finalizeAuth(response);
    },
    [finalizeAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authApi.register(payload);
      finalizeAuth(response);
    },
    [finalizeAuth]
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleLoginPayload) => {
      const response = await authApi.googleLogin(payload);
      finalizeAuth(response);
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
