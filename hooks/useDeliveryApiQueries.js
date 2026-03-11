import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";

export const queryKeys = {
  deliveryReceiptList: ["deliveryReceiptList"],
  users: ["users"],
  deliveryDocketNumberLookUp: ["deliveryDocketNumberLookUp"],
  deliveryReciptDetailsByDocketId: ["deliveryReciptDetailsByDocketId"],
  deliveryReciptPayMode: ["deliveryReciptPayMode"],
  deliveryReciptPayHeads: ["deliveryReciptPayHeads"],
};

// Delivery Receipt list API -- Get method
export const useGetDeliveryReceiptList = (finCode, rcptType, fromDate, toDate, pageSize, sortColumn, sortDirection, options = {}) => {
  const { searchText, ...queryOptions } = options;
  return useInfiniteQuery({
    queryKey: [...queryKeys.deliveryReceiptList, finCode, rcptType, fromDate, toDate, searchText, Number(pageSize), sortColumn, sortDirection],
    queryFn: async ({ pageParam }) => {
      try {
        const params = {
          finCode: finCode,
          rcptType: rcptType,
          fromDate: fromDate,
          toDate: toDate,
          searchText: searchText,
          pageNumber: pageParam,
          pageSize: Number(pageSize),
          sortColumn: sortColumn,
          sortDirection: sortDirection,
        };

        // console.log("API Payload:", params);
        const response = await apiClient.post(API_ENDPOINTS.DELIVERY_RECEIPT_LIST_API, params);
        // console.log("Delivery Receipt List API response:", response?.data.dataValue);
        return response?.data.dataValue || [];
      } catch (error) {
        console.error("getDeliveryReceiptList ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get delivery receipt list");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned fewer items than pageSize, no more pages
      if (lastPage.length < Number(pageSize)) {
        return undefined;
      }
      // Otherwise, next page number
      return allPages.length + 1;
    },
    enabled: Boolean(finCode) && rcptType && Number(pageSize) > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...queryOptions,
  });
};

// Docket number lookup API -- Get method
export const useGetDocketNumberLookup = (entryDate, branchCode, rcptType, firmCode, pageSize, options = {}) => {
  const { docketNoFilter = "", ...queryOptions } = options;
  return useInfiniteQuery({
    queryKey: [...queryKeys.deliveryDocketNumberLookUp, entryDate, branchCode, rcptType, firmCode, docketNoFilter, Number(pageSize)],
    queryFn: async ({ pageParam }) => {
      try {
        const params = {
          entryDate: entryDate,
          branchCode: branchCode,
          rcptType: rcptType,
          firmCode: firmCode,
          pageNumber: pageParam,
          pageSize: Number(pageSize),
          docketNoFilter: docketNoFilter,
        };

        console.log("API Payload:", params);

        const response = await apiClient.get(`${API_ENDPOINTS.DOCKET_NUMBER_LOOKUP}?${new URLSearchParams(params).toString()}`);
        // console.log("Docket Number Lookup API response:", response);
        return response?.data.dataValue || [];
      } catch (error) {
        console.error("getDocketNumberLookup ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get docket number lookup");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned fewer items than pageSize, no more pages
      if (lastPage.length < Number(pageSize)) {
        return undefined;
      }
      // Otherwise, next page number
      return allPages.length + 1;
    },
    enabled: Boolean(entryDate) && branchCode && rcptType && firmCode && Number(pageSize) > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...queryOptions,
  });
};
// Delivery receipt details by docket ID API -- Get method
export const useGetDeliveryReciptDetailsByDocketId = (docketId, firmCode, finCode, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.deliveryReciptDetailsByDocketId, docketId, firmCode, finCode],
    queryFn: async () => {
      try {
        const params = {
          docketId: docketId,
          firmCode: firmCode,
          finCode: finCode,
        };

        console.log("API Payload:", params);

        const response = await apiClient.get(`${API_ENDPOINTS.DELIVERY_RECEIPT_DETAILS_BY_DOCKET}?${new URLSearchParams(params).toString()}`);
        console.log("Delivery Receipt Details by Docket ID API response:", response);
        return response?.data?.dataValue.customer || null;
      } catch (error) {
        console.error("getDeliveryReciptDetailsByDocketId ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get delivery receipt details by docket ID");
      }
    },

    enabled: docketId && firmCode && finCode,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Delivery receipt pay mode API -- Get method
export const useGetDeliveryPayMode = (firmCode, finCode, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.deliveryReciptPayMode, firmCode, finCode],
    queryFn: async () => {
      try {
        const params = {
          firmCode: firmCode,
          finCode: finCode,
        };

        console.log("API Payload:", params);

        const response = await apiClient.get(`${API_ENDPOINTS.DELIVERY_RECEIPT_PAY_MODE}?${new URLSearchParams(params).toString()}`);
        console.log("Delivery Receipt Pay Mode API response:", response);
        return response?.data?.dataValue || null;
      } catch (error) {
        console.error("getDeliveryReciptPayMode ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get delivery receipt pay mode");
      }
    },

    enabled: firmCode && finCode,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Delivery receipt pay mode API -- Get method
export const useGetDeliveryPayHeads = (firmCode, payMode, options = {}) => {
  const { searchText = "", ...queryOptions } = options;

  return useInfiniteQuery({
    queryKey: [...queryKeys.deliveryReciptPayHeads, firmCode, payMode, searchText],
    queryFn: async ({ pageParam }) => {
      try {
        const params = {
          firmCode: firmCode,
          payMode: payMode,
          pageNumber: pageParam,
          searchText: searchText,
          pageSize: 20,
        };
        console.log("API Payload:", params);
        const response = await apiClient.post(API_ENDPOINTS.DELIVERY_RECEIPT_PAY_HEADS, params);
        console.log("Delivery Receipt Pay Heads API response:", response?.data?.dataValue);
        return response?.data?.dataValue || []; // Return empty array, not null
      } catch (error) {
        console.error("getDeliveryReciptPayHeads ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get delivery receipt pay heads");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Check if lastPage is array and has fewer items than pageSize
      if (!Array.isArray(lastPage) || lastPage.length < 20) {
        return undefined;
      }
      // Otherwise, next page number
      return allPages.length + 1;
    },
    enabled: Boolean(firmCode) && Boolean(payMode), // Use Boolean() for consistency
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...queryOptions,
  });
};
