/**
 * Dynamic API Base URL configuration for ASD Screening CDSS.
 * Supports Next.js environment variable NEXT_PUBLIC_API_URL with fallback to http://localhost:8000.
 *
 * Developed by Urvish Soni and Zankhana Mehta under the guidance of Prof. Shyam Kamal, IIT BHU.
 */

export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

/**
 * Returns the fully-qualified API URL for a given endpoint path.
 * Ensures no duplicate slashes.
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
