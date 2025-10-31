import { API_ENDPOINTS } from "../config/endpoints";
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
    try {
      const response = await apiClient.post(API_ENDPOINTS.PROCEED_DASHBOARD, { companyCode, branchCode, finCode });
      const { session } = response.data.data;
      const existingCredentials = await SecureStoreService.getCredentials();
      await SecureStoreService.saveCredentials({
        token: existingCredentials.token, // New token from dashboard proceed
        refreshToken: existingCredentials.refreshToken, // Keep existing
        user: existingCredentials.user, // Keep existing
        sessionData: session, // New session data
      });
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
