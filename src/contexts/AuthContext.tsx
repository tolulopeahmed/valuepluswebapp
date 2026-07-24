"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, clearTokens, setTokens } from "@/lib/api";

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_author: boolean;
  is_student: boolean;
  is_verified: boolean;
  avatar: string | null;
  account_type_label: string;
  created_at: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

interface VerifyEmailPayload {
  email: string;
  code: string;
  password?: string;
  password_confirm?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerDirect: (data: RegisterPayload) => Promise<void>;
  verifyEmail: (data: VerifyEmailPayload) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const me = await apiFetch<AuthUser>("/auth/me/");
        if (!cancelled) setUser(me);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<TokenResponse>("/auth/login/", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });
    setTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
  }, []);

  const registerDirect = useCallback(async (payload: RegisterPayload) => {
    await apiFetch("/auth/register/", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  }, []);

  const verifyEmail = useCallback(async (payload: VerifyEmailPayload) => {
    const data = await apiFetch<TokenResponse>("/auth/verify-email/", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(payload),
    });
    setTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    await apiFetch("/auth/resend-verification/", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email }),
    });
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await apiFetch("/auth/password-reset/", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email }),
    });
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        registerDirect,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
