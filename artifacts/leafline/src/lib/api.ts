import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

export function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || window.location.origin;
}

export function initApiClient(getToken: () => string | null) {
  const apiBase = getApiBase();
  setBaseUrl(`${apiBase}/api`);
  setAuthTokenGetter(getToken);
}

export async function apiFetch(path: string, options: RequestInit = {}, token?: string | null) {
  const base = getApiBase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${base}/api${path}`, { ...options, headers });
  return res;
}
