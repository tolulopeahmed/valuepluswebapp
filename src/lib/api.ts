import { notify } from "@/lib/snackbar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

const ACCESS_KEY = "vp_access";
const REFRESH_KEY = "vp_refresh";

export interface Tokens {
  access: string | null;
  refresh: string | null;
}

export function getTokens(): Tokens {
  if (typeof window === "undefined") return { access: null, refresh: null };
  return {
    access: window.localStorage.getItem(ACCESS_KEY),
    refresh: window.localStorage.getItem(REFRESH_KEY),
  };
}

export function setTokens(tokens: { access: string; refresh?: string }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  if (tokens.refresh) {
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// DRF validation errors show up as {"detail": "..."}, {"non_field_errors":
// [...]}, or {"<field>": ["msg", ...]} — this collapses any of those shapes
// into one readable string for a generic error banner.
export function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Something went wrong. Please try again.";
  }

  const record = body as Record<string, unknown>;

  if (typeof record.detail === "string") return record.detail;
  if (typeof record.message === "string") return record.message;

  const firstKey = Object.keys(record)[0];
  if (firstKey) {
    const value = record[firstKey];
    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
    if (typeof value === "string") return value;
  }

  return "Something went wrong. Please try again.";
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const data = await res.json();
    setTokens({ access: data.access, refresh: data.refresh });
    return data.access as string;
  } catch {
    clearTokens();
    return null;
  }
}

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// One-shot 401 refresh-and-retry: attaches the access token (unless
// skipAuth), and on a 401 tries exactly one silent refresh + retry before
// giving up and clearing the session.
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;

  async function doFetch(): Promise<Response> {
    const { access } = getTokens();
    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    };
    if (!skipAuth && access) {
      finalHeaders.Authorization = `Bearer ${access}`;
    }
    return fetch(`${API_BASE_URL}${path}`, { ...rest, headers: finalHeaders });
  }

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await doFetch();
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = extractErrorMessage(body);
    notify(message, "error");
    throw new ApiError(res.status, body, message);
  }

  // Every mutation the backend cares to narrate returns a "message"
  // field (register, login, password-reset, resend, quote-request,
  // verify-email, ...); plain list/detail GETs never do, so this
  // naturally only fires for the calls that actually have something to
  // say — no per-call-site wiring needed.
  if (body && typeof body === "object" && typeof (body as Record<string, unknown>).message === "string") {
    notify((body as Record<string, unknown>).message as string, "success");
  }

  return body as T;
}
