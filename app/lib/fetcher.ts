import { getToken } from './auth';

/**
 * Fetch wrapper that automatically attaches the stored auth token.
 * Does NOT set Content-Type when body is FormData — the browser must set
 * the multipart boundary itself. For all other requests it defaults to
 * application/json.
 * Does NOT redirect on 401 — callers handle errors themselves.
 */
export async function authedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const baseHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Token ${token}` } : {}),
    // Only set Content-Type for non-multipart requests.
    // For FormData the browser sets it automatically with the correct boundary.
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
  };

  return fetch(url, {
    ...options,
    headers: {
      ...baseHeaders,
      // Caller-supplied headers win (e.g. explicit Content-Type override)
      ...(options.headers as Record<string, string> || {}),
    },
  });
}
