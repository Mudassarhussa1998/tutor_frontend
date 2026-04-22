import { getToken } from './auth';

/**
 * Fetch wrapper that automatically attaches the stored auth token.
 * Does NOT redirect on 401 — callers handle errors themselves.
 */
export async function authedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  });
}
