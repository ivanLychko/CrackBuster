/**
 * Utility functions for HTTP Basic Authentication
 */

/**
 * Creates a Basic Auth header value from username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {string} Base64 encoded credentials
 */
export function createBasicAuthHeader(username, password) {
  const credentials = `${username}:${password}`;
  return `Basic ${btoa(credentials)}`;
}

/**
 * Stores authentication credentials in sessionStorage
 * @param {string} username 
 * @param {string} password 
 */
export function storeAuthCredentials(username, password) {
  const authHeader = createBasicAuthHeader(username, password);
  sessionStorage.setItem('authHeader', authHeader);
  sessionStorage.setItem('authUsername', username);
}

/**
 * Gets the stored authentication header
 * @returns {string|null} The auth header or null if not stored
 */
export function getAuthHeader() {
  return sessionStorage.getItem('authHeader');
}

/**
 * Clears stored authentication credentials
 */
export function clearAuthCredentials() {
  sessionStorage.removeItem('authHeader');
  sessionStorage.removeItem('authUsername');
}

/**
 * Checks if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuthHeader();
}

/**
 * Fetches with authentication header
 * @param {string} url 
 * @param {RequestInit} options 
 * @returns {Promise<Response>}
 */
export async function authenticatedFetch(url, options = {}) {
  const authHeader = getAuthHeader();
  
  if (!authHeader) {
    throw new Error('Not authenticated');
  }

  // Use relative paths - they work for both:
  // - Dev: webpack dev server proxy handles /api -> localhost:3000
  // - Production: same origin, so relative paths work directly
  // Only convert to absolute if URL already starts with http
  const fullUrl = url.startsWith('http') ? url : url;

  // Don't override Content-Type if body is FormData (it sets its own boundary)
  const headers = new Headers(options.headers);
  headers.set('Authorization', authHeader);
  
  // If body is FormData, don't set Content-Type (browser will set it with boundary)
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    // Ensure credentials are sent (important for CORS if needed)
    credentials: 'same-origin',
  });

  // If we get 401, clear credentials
  if (response.status === 401) {
    clearAuthCredentials();
  }

  return response;
}


/**
 * Verifies credentials by making a test request
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<boolean>}
 */
export async function verifyCredentials(username, password) {
  const authHeader = createBasicAuthHeader(username, password);
  
  try {
    // Use relative path - works for both dev (via proxy) and production (same origin)
    // The webpack dev server proxy handles /api -> localhost:3000 in development
    // In production, the same Express server handles both static files and API routes
    const apiUrl = '/api/admin/services';
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
      // Ensure credentials are sent (important for CORS if needed)
      credentials: 'same-origin',
    });

    if (response.ok || response.status === 404) {
      // 404 is ok - it means we're authenticated but endpoint might not exist
      storeAuthCredentials(username, password);
      return true;
    }
    
    // Log the error for debugging
    console.error('Authentication failed:', {
      status: response.status,
      statusText: response.statusText,
      url: apiUrl,
      origin: typeof window !== 'undefined' ? window.location.origin : 'unknown'
    });
    
    return false;
  } catch (error) {
    console.error('Error verifying credentials:', error);
    console.error('API URL attempted: /api/admin/services');
    console.error('Current origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown');
    return false;
  }
}

