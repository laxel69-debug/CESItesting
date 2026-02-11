/**
 * Thin wrapper around fetch() that automatically injects the
 * Authorization header from localStorage when a token exists.
 *
 * Usage:
 *   import { apiFetch, authHeaders } from '../api/apiFetch';
 *
 *   // Simple GET
 *   const res = await apiFetch('/api/grades/items/');
 *
 *   // POST with JSON body
 *   const res = await apiFetch('/api/grades/items/', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(payload),
 *   });
 */
import { getToken } from '../Auth/auth';

/**
 * Returns a headers object with the Authorization token (if present).
 * Merge additional headers by passing an object.
 */
export function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
}

/**
 * Drop-in replacement for fetch() that adds credentials + auth token.
 */
export async function apiFetch(url, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(url, {
    credentials: 'include',
    ...rest,
    headers: authHeaders(extraHeaders),
  });
}
