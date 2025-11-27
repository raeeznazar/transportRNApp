import env from "./environment";

// Use relative paths here and let api client `baseURL` (from environment)
// combine with these when making requests. This avoids duplicating the
// base URL in multiple places and reduces the chance of mismatched hosts.
export const API_BASE_URL = env?.API_BASE_URL;
export const API_TIMEOUT = env?.API_TIMEOUT;

export function buildUrl(path) {
  // Accept either a relative path or a full URL
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export const API_ENDPOINTS = {
  // Auth endpoints (relative to api base URL)

  //LOGIN AND LOGOUT
  LOGIN: "/Auth/login",
  LOGOUT: "/Auth/logout",

  //LOGIN SETUP SCREEN
  USER_COMPANIES: "/Auth/user-companies",
  USER_FINANCIAL_YEARS: "/Auth/financial-years",
  PROCEED_DASHBOARD: "/Auth/initialize-session",

  REFRESH_TOKEN: "/Auth/refresh",

  // Inward endpoints
  USER_INWARDS_DATA: "/Inward/Inward_GetDetails",
  USER_MANIFEST_ID_LIST: "/Inward/FetchManifestList",
  MANIFEST_TABLE_DATA: "/Inward/FetchManifestDetails",

  // Other endpoints
  DASHBOARD: "/dashboard",
};

// Example usage:
// import { API_BASE_URL, buildUrl, API_ENDPOINTS } from '../config/endpoints'
// const full = buildUrl(API_ENDPOINTS.DASHBOARD)
