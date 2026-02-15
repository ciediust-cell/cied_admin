const BASE_URL = "http://localhost:4000/api";

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");

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
