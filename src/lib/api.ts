/**
 * Simple fetch wrapper for API calls.
 * No auth tokens needed — this is a single-user private app.
 */
async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  // Link caller signal if provided
  if (options.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    if (!response.ok) {
      let errorMessage = 'API Error';
      try {
        const errBody = await response.json();
        errorMessage = errBody.error || errBody.message || errorMessage;
      } catch {
        if (response.status === 504) {
          errorMessage = 'The AI model took too long to reply (timeout). Please try speaking again.';
        } else if (response.status === 413) {
          errorMessage = 'Audio recording was too large. Please record a shorter message.';
        } else if (response.status === 503) {
          errorMessage = 'AI service is experiencing high demand. Please try again in a moment.';
        } else {
          errorMessage = `Server returned error (${response.status}). Please try again.`;
        }
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request was canceled or timed out after 45s. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: (url: string, options?: RequestInit) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url: string, body: any, options?: RequestInit) =>
    apiFetch(url, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (url: string, body: any, options?: RequestInit) =>
    apiFetch(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  del: (url: string, options?: RequestInit) => apiFetch(url, { ...options, method: 'DELETE' }),
};
