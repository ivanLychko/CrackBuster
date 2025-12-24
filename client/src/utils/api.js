/**
 * API utility functions
 * Handles API requests with proper URL construction for both dev and production
 */

/**
 * Get the API base URL
 * In production, uses API_URL from environment or window.__INITIAL_STATE__
 * In development, uses relative paths (webpack dev server proxy handles it)
 */
export const getApiUrl = () => {
  // Check if we have API_URL in initial state (from SSR)
  if (typeof window !== 'undefined' && window.__INITIAL_STATE__?.apiUrl) {
    return window.__INITIAL_STATE__.apiUrl;
  }
  
  // In production, if API_URL is set in environment, use it
  // Otherwise, use relative path (same origin)
  return '';
};

/**
 * Build full API URL
 * @param {string} path - API path (e.g., '/api/seo/home')
 * @returns {string} Full API URL
 */
export const buildApiUrl = (path) => {
  const apiBase = getApiUrl();
  
  // If path already starts with http, return as is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If we have API base URL, use it
  if (apiBase) {
    // Remove trailing slash from apiBase if present
    const base = apiBase.replace(/\/$/, '');
    return `${base}${normalizedPath}`;
  }
  
  // Otherwise, use relative path
  return normalizedPath;
};

/**
 * Fetch from API with proper error handling
 * @param {string} path - API path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export const apiFetch = async (path, options = {}) => {
  const url = buildApiUrl(path);
  
  // Don't override Content-Type if body is FormData (it sets its own boundary)
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  } else {
    // Remove Content-Type for FormData - browser will set it with boundary
    headers.delete('Content-Type');
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
  
  // Check if response is JSON
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    // If we got HTML instead of JSON, it means we hit the wrong endpoint
    if (contentType.includes('text/html') || text.trim().startsWith('<!')) {
      throw new Error(`API endpoint returned HTML instead of JSON. This usually means the API URL is incorrect. URL: ${url}`);
    }
    throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`);
  }
  
  return response;
};

