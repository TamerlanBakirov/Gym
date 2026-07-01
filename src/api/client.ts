import { API_BASE } from '../config';
import { tokenStore } from './tokens';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach access token (default true)
};

/** Called when the session can no longer be refreshed (forces logout). */
let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

async function raw<T>(path: string, opts: Options, accessToken: string | null): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opts.auth !== false && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`, data?.details);
  }
  return data as T;
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  // De-duplicate concurrent refreshes.
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const data = await raw<{ accessToken: string; refreshToken: string }>(
          '/auth/refresh',
          { method: 'POST', body: { refreshToken }, auth: false },
          null
        );
        await tokenStore.set(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

/** Authenticated request with automatic one-time refresh on 401. */
export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  try {
    return await raw<T>(path, opts, tokenStore.getAccess());
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && opts.auth !== false) {
      const ok = await tryRefresh();
      if (ok) return raw<T>(path, opts, tokenStore.getAccess());
      await tokenStore.clear();
      onSessionExpired?.();
    }
    throw err;
  }
}
