import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";
// Query Keys - centralized for cache management
export const queryKeys = {
  inward: ["inward"],
  users: ["users"],
  manifests: ["manifests"],
  manifestsTable: ["manifestsTable"],
  // Add more query keys based on your screensApiService
};

// Fetch user inwards data
export const useGetInward = (branchCode, fromDate, toDate) => {
  return useQuery({
    queryKey: [...queryKeys.inward, branchCode, fromDate, toDate],
    queryFn: async () => {
      // console.log("getInwardsData called with:", { branchCode, fromDate, toDate });
      try {
        const response = await apiClient.get(API_ENDPOINTS.USER_INWARDS_DATA, {
          params: {
            branchCode,
            fromDate,
            toDate,
          },
        });
        // console.log("getInwardsData RESPONSE Data:", response);
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

// Fetch user manifest ID list data
export const useGetManifestIdList = (thcId, toStation) => {
  // console.log("useGetManifestIdList called with:", { thcId, toStation });
  return useQuery({
    queryKey: [...queryKeys.manifests, thcId, toStation],
    queryFn: async () => {
      // console.log("getManifestIdList called with:", { thcId, toStation });
      try {
        const response = await apiClient.get(API_ENDPOINTS.USER_MANIFEST_ID_LIST, {
          params: {
            thcId,
            toStation,
          },
        });

        // console.log("getManifestIdList RESPONSE Data:", response.data);
        return response.data.dataValue;
      } catch (error) {
        console.error("getManifestIdList ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get manifest ID list");
      }
    },
    enabled: !!thcId && !!toStation,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

// Fetch user manifest table data
export const useGetManifestTable = (manID) => {
  // console.log("useGetManifestTable called with:", { manID, type: typeof manID, isEnabled: !!manID });
  return useQuery({
    queryKey: [...queryKeys.manifestsTable, manID],
    queryFn: async () => {
      // console.log("getManifestTable called with:", { manID });
      try {
        const response = await apiClient.get(API_ENDPOINTS.MANIFEST_TABLE_DATA, {
          params: {
            manId: manID,
          },
        });

        // console.log("getManifestTable RESPONSE Data:", response.data);
        return response.data.dataValue;
      } catch (error) {
        console.error("getManifestTable ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get ManifestTable RESPONSE Data");
      }
    },
    enabled: !!manID,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};
