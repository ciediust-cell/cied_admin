import { useAuthStore } from "../../store/authStore";
import {
  ADMIN_API_BASE,
  validateRefreshPayload,
} from "./adminApiClient";

const ADMIN_API_PREFIX = ADMIN_API_BASE;
const LOGIN_URL = `${ADMIN_API_PREFIX}/auth/login`;
const REFRESH_URL = `${ADMIN_API_PREFIX}/auth/refresh`;
const LOGOUT_URL = `${ADMIN_API_PREFIX}/auth/logout`;

let interceptorInstalled = false;
let originalFetch: typeof window.fetch | null = null;
let refreshPromise: Promise<string | null> | null = null;

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function buildHeaders(
  input: RequestInfo | URL,
  init?: RequestInit,
  accessToken?: string,
): Headers {
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  const initHeaders = new Headers(init?.headers);

  initHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function isProtectedAdminRequest(url: string): boolean {
  if (!url.startsWith(ADMIN_API_PREFIX)) return false;
  if (url.startsWith(LOGIN_URL)) return false;
  if (url.startsWith(REFRESH_URL)) return false;
  if (url.startsWith(LOGOUT_URL)) return false;
  return true;
}

async function refreshAccessToken(): Promise<string | null> {
  const { setAccessToken, logout } = useAuthStore.getState();

  try {
    const response = await (originalFetch as typeof window.fetch)(REFRESH_URL, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      logout();
      return null;
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!validateRefreshPayload(payload)) {
      logout();
      return null;
    }

    const nextAccessToken = payload.accessToken;
    setAccessToken(nextAccessToken);
    return nextAccessToken;
  } catch {
    logout();
    return null;
  }
}

async function getFreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export function installAuthFetchInterceptor() {
  if (interceptorInstalled || typeof window === "undefined") return;

  originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = getRequestUrl(input);
    const protectedAdminRequest = isProtectedAdminRequest(url);
    const currentToken = useAuthStore.getState().accessToken;

    const initialHeaders = buildHeaders(
      input,
      init,
      protectedAdminRequest ? currentToken || undefined : undefined,
    );

    const initialResponse = await (originalFetch as typeof window.fetch)(input, {
      ...init,
      headers: initialHeaders,
    });

    if (!protectedAdminRequest || initialResponse.status !== 401) {
      return initialResponse;
    }

    const freshAccessToken = await getFreshAccessToken();
    if (!freshAccessToken) return initialResponse;

    const retryHeaders = buildHeaders(input, init, freshAccessToken);

    return (originalFetch as typeof window.fetch)(input, {
      ...init,
      headers: retryHeaders,
    });
  };

  interceptorInstalled = true;
}
