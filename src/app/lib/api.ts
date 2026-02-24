import { useAuthStore } from "../../store/authStore";

const envApiOrigin =
  (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env?.VITE_API_ORIGIN ?? "";

const normalizedApiOrigin = envApiOrigin.trim();

if (!normalizedApiOrigin) {
  throw new Error("Missing VITE_API_ORIGIN. Set it in your .env file.");
}

const API_ORIGIN = normalizedApiOrigin.replace(/\/+$/, "");
const BASE_URL = `${API_ORIGIN}/api`;

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API error");
  }

  return response.json();
}
