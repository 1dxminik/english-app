/**
 * Simple fetch wrapper for API calls.
 * No auth tokens needed — this is a single-user private app.
 */
async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMessage = 'API Error';
    try {
      const errBody = await response.json();
      errorMessage = errBody.error || errBody.message || errorMessage;
    } catch (_e) { /* ignore parse errors */ }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const apiClient = {
  get: (url: string) => apiFetch(url),
  post: (url: string, body: any) => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any) => apiFetch(url, { method: 'PUT', body: JSON.stringify(body) }),
  del: (url: string) => apiFetch(url, { method: 'DELETE' }),
};
