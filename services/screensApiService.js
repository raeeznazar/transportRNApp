import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "./apiService";

export const ScreensApiService = {
  async getInwardsData(branchCode, fromDate, toDate) {
    console.log("getInwardsData called with:", { branchCode, fromDate, toDate });
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_INWARDS_DATA, {
        params: {
          branchCode: branchCode,
          fromDate: fromDate,
          toDate: toDate,
        },
      });

      console.log("getInwardsData RESPONSE Data:", response);
      return {
        success: true,
        data: response.data.dataValue,
      };
    } catch (error) {
      console.error("getInwardsData ERROR Details:", {
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
};
