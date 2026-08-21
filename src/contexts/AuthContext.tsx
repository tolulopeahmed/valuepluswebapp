"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, clearTokens, getTokens, setTokens } from "@/lib/api";

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
  preferred_mode: "learner" | "publisher";
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
  phone_number?: string;
  password: string;
  password_confirm: string;
  referrer_email?: string;
  heard_about?: string;
}

interface VerifyEmailPayload {
  email: string;
  code: string;
  password?: string;
  password_confirm?: string;
}

interface ConfirmPasswordResetPayload {
  email: string;
  code: string;
  new_password: string;
  new_password_confirm: string;
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
  confirmPasswordReset: (data: ConfirmPasswordResetPayload) => Promise<void>;
  updateAvatar: (file: Blob) => Promise<void>;
  updateProfile: (data: ProfilePayload) => Promise<void>;
  logout: () => Promise<void>;
}

export interface ProfilePayload {
  first_name: string;
  last_name: string;
  phone_number: string;
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
      // No point hitting the network (or surfacing an error toast) to
      // check who's logged in when there's no token at all — that's not
      // an error, it's just an anonymous visitor.
      if (!getTokens().access) {
        setIsLoading(false);
        return;
      }

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

  const confirmPasswordReset = useCallback(async (payload: ConfirmPasswordResetPayload) => {
    await apiFetch("/auth/password-reset/confirm/", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(payload),
    });
  }, []);

  // Cropped image comes in as a Blob (canvas output has no filename), so
  // it's appended under a fixed name — the backend's ImageField only
  // cares about the bytes/content-type, not the original filename.
  const updateAvatar = useCallback(async (file: Blob) => {
    const formData = new FormData();
    formData.append("avatar", file, "avatar.jpg");
    const data = await apiFetch<AuthUser>("/auth/me/", {
      method: "PATCH",
      body: formData,
    });
    setUser(data);
  }, []);

  const updateProfile = useCallback(async (payload: ProfilePayload) => {
    const data = await apiFetch<AuthUser>("/auth/me/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    setUser(data);
  }, []);

  const logout = useCallback(async () => {
    // Fire-and-forget: blacklists the refresh token server-side so it
    // can never be replayed, but doesn't hold up the visible logout —
    // the token headers are already captured by the time this call goes
    // out, so clearing local state right after is safe either way.
    const { refresh } = getTokens();
    if (refresh) {
      apiFetch("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      }).catch(() => {});
    }
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
        confirmPasswordReset,
        updateAvatar,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
