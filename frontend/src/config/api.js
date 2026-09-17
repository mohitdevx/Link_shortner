/**
 * Centralized API & Backend configuration
 */

// Backend origin without trailing slashes
export const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * Builds an absolute API URL for the given endpoint.
 * @param {string} endpoint - e.g. "/api/me" or "/api/v1/newurl" or "/profile"
 * @returns {string} Fully qualified backend URL
 */
export const getApiUrl = (endpoint = "") => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (path.startsWith("/api")) {
    return `${BACKEND_URL}${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

/**
 * Builds the full short URL redirect link.
 * @param {string} redirectKey - Unique redirect hash key
 * @returns {string} Fully qualified short URL (e.g. "http://localhost:5000/api/v1/abcd")
 */
export const getShortUrl = (redirectKey) => {
  return `${BACKEND_URL}/api/v1/${redirectKey}`;
};
