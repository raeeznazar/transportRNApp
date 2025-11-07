import { API_ENDPOINTS } from "../config/endpoints";
import { useAuthStore } from "../stores/authStore";
import apiClient from "./apiService";
import { SecureStoreService } from "./keychainService";

export const AuthService = {
  async login(username, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
        userId: username,
        password,
      });
      const { accessToken, refreshToken, user } = response.data.data;
      await SecureStoreService.saveCredentials({
        token: accessToken,
        refreshToken,
        user,
        sessionData: null,
      });

      // Update Zustand store
      useAuthStore.getState().setUser(user);

      return {
        success: true,
        data: {
          token: accessToken,
          refreshToken,
          user,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  },

  async logout() {
    try {
      // Call logout endpoint
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Always clear local credentials
      await SecureStoreService.clearCredentials();

      // Clear Zustand store
      useAuthStore.getState().clearAuth();
    }
  },

  async isLoggedIn() {
    return await SecureStoreService.hasCredentials();
  },

  async getCompanies(selectedType) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.USER_COMPANIES, {
        branchCode: selectedType,
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("getCompanies ERROR Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get user companies",
      };
    }
  },

  async getFinancialYears(branchCode, companyCode) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_FINANCIAL_YEARS, {
        params: {
          companyCode: companyCode,
          branchCode: branchCode,
        },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("getFinancialYears ERROR Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });
      return {
        success: false,
        error: error.response?.data?.message || "Failed to get financial years",
      };
    }
  },

  async dashBoardProced(companyCode, branchCode, finCode) {
    console.log("dashBoardProced called with:", { companyCode, branchCode, finCode });
    try {
      const response = await apiClient.post(API_ENDPOINTS.PROCEED_DASHBOARD, { companyCode, branchCode, finCode });
      const { session } = response.data.data;
      console.log("Dashboard Proceed Response:", session);
      const existingCredentials = await SecureStoreService.getCredentials();
      await SecureStoreService.saveCredentials({
        token: existingCredentials.token,
        refreshToken: existingCredentials.refreshToken,
        user: existingCredentials.user,
        sessionData: session,
      });

      // Update Zustand store with session data
      console.log("Setting session data:", session);
      useAuthStore.getState().setSessionData(session);

      // Verify it was stored
      const storedSession = useAuthStore.getState().sessionData;
      console.log("Stored session data:", storedSession);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("dashBoardProced ERROR Details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });
      return {
        success: false,
        error: error.response?.data?.message || "Failed to proceed to dashboard",
      };
    }
  },
};
