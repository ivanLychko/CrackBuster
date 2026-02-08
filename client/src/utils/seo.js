/**
 * SEO utility functions
 */

/**
 * Get the base URL for canonical links and Open Graph
 * Uses window.location in browser, falls back to hardcoded domain
 */
export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  // Fallback for SSR
  return 'https://crackbuster.ca';
};

/**
 * Get full canonical URL for a path
 */
export const getCanonicalUrl = (path = '') => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Default Open Graph image
 */
export const getDefaultOgImage = () => {
  return `${getBaseUrl()}/images/og-image.webp`;
};

/**
 * Default site name
 */
export const SITE_NAME = 'CrackBuster';

/**
 * Default site description
 */
export const DEFAULT_DESCRIPTION = 'Professional foundation crack repair services in Edmonton, Canada. Expert solutions for basement waterproofing, foundation repair, and crack injection.';








