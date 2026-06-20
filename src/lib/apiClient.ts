/**
 * Thin API client for the Praxos LMS backend (backend/lms_app).
 *
 * Set VITE_API_ORIGIN to the backend (e.g. http://localhost:8000) to use live
 * data. When unset or unreachable, callers fall back to the local mock so the
 * app stays fully functional offline / in preview.
 */
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "");

export const apiEnabled = Boolean(API_ORIGIN);

export class ApiError extends Error {}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_ORIGIN) throw new ApiError("VITE_API_ORIGIN not configured");
  const res = await fetch(`${API_ORIGIN}${path}`, {
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) throw new ApiError(`GET ${path} → ${res.status}`);
  return (await res.json()) as T;
}

/** Authenticated JSON request (Clerk bearer token). */
export async function apiSend<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body: unknown,
  token?: string | null,
): Promise<T> {
  if (!API_ORIGIN) throw new ApiError("VITE_API_ORIGIN not configured");
  const res = await fetch(`${API_ORIGIN}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
  });
  if (!res.ok) {
    let detail = `${method} ${path} → ${res.status}`;
    try {
      const j = await res.json();
      if (j?.detail) detail = j.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail);
  }
  return (res.status === 204 ? (undefined as T) : ((await res.json()) as T));
}

export const apiPost = <T>(path: string, body: unknown, token?: string | null) =>
  apiSend<T>("POST", path, body, token);

/** Multipart file upload (Clerk bearer token). Lets the browser set the boundary. */
export async function apiUpload<T>(
  path: string,
  file: File,
  token?: string | null,
  fields?: Record<string, string>,
): Promise<T> {
  if (!API_ORIGIN) throw new ApiError("VITE_API_ORIGIN not configured");
  const form = new FormData();
  form.append("file", file, file.name);
  for (const [k, v] of Object.entries(fields ?? {})) form.append(k, v);
  const res = await fetch(`${API_ORIGIN}${path}`, {
    method: "POST",
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  if (!res.ok) {
    let detail = `POST ${path} → ${res.status}`;
    try {
      const j = await res.json();
      if (j?.detail) detail = j.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail);
  }
  return (await res.json()) as T;
}

/**
 * Fetch from the backend, falling back to a local value on any failure
 * (no origin configured, network error, non-2xx). Never throws.
 */
export async function getOrFallback<T>(path: string, fallback: T): Promise<T> {
  if (!apiEnabled) return fallback;
  try {
    return await apiGet<T>(path);
  } catch {
    return fallback;
  }
}
