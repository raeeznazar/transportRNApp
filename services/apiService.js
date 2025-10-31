import axios from "axios";
import { API_ENDPOINTS } from "../config/endpoints";
import environment from "../config/environment";
import { SecureStoreService } from "./keychainService";

// Create axios instance
const apiClient = axios.create({
  baseURL: environment.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "text/plain",
  },
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStoreService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error adding token to request:", error);
    }
    // Log the request information
    const fullUrl =
      config.baseURL && config.url ? config.baseURL.replace(/\/$/, "") + "/" + config.url.replace(/^\//, "") : config.url || config.baseURL;
    // console.log("API Request:", {
    //   method: config.method?.toUpperCase(),
    //   url: fullUrl,
    //   baseURL: config.baseURL,
    //   endpoint: config.url,
    //   data: config.data,
    // });
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/****
 * Response interceptor - Handle responses and errors
 * ****/
apiClient.interceptors.response.use(
  (response) => {
    // console.log("API Response:", {
    //   status: response.status,
    //   url: response.config.url,
    //   data: response.data,
    // });
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    // Build a helpful URL view
    let errorUrl = originalRequest.url;
    if (originalRequest.baseURL && originalRequest.url) {
      errorUrl = originalRequest.baseURL.replace(/\/$/, "") + "/" + originalRequest.url.replace(/^\//, "");
    }
    // console.error("API Error:", {
    //   status: error.response?.status,
    //   url: errorUrl,
    //   message: error.response?.data?.message || error.message,
    //   responseData: error.response?.data,
    // });

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStoreService.getRefreshToken();

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(
            `${environment.API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
            { refreshToken: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                accept: "text/plain",
              },
            }
          );
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data;
          const existingCredentials = await SecureStoreService.getCredentials();
          await SecureStoreService.saveCredentials({
            token: newToken,
            refreshToken: newRefreshToken,
            user: existingCredentials.user, // preserve user data
            sessionData: existingCredentials.sessionData, // preserve session data
          });
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Clear stored credentials and handle logout
        await SecureStoreService.clearCredentials();
        // Optional: You can throw a custom error to handle in components
        const logoutError = new Error("Session expired, please login again");
        logoutError.code = "SESSION_EXPIRED";
        // return Promise.reject(logoutError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
