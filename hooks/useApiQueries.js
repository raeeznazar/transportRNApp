import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";
// Query Keys - centralized for cache management
export const queryKeys = {
  inward: ["inward"],
  users: ["users"],
  // Add more query keys based on your screensApiService
};

// Example: Fetch user data
export const useGetInward = (branchCode, fromDate, toDate) => {
  return useQuery({
    queryKey: [...queryKeys.inward, branchCode, fromDate, toDate],
    queryFn: async () => {
      console.log("getInwardsData called with:", { branchCode, fromDate, toDate });

      try {
        const response = await apiClient.get(API_ENDPOINTS.USER_INWARDS_DATA, {
          params: {
            branchCode,
            fromDate,
            toDate,
          },
        });

        console.log("getInwardsData RESPONSE Data:", response);
        return response.data.dataValue;
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
        throw new Error(error.response?.data?.message || "Failed to get inwards data");
      }
    },
    enabled: !!branchCode && !!fromDate && !!toDate,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};
