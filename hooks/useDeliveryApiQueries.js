import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";

export const queryKeys = {
  deliveryReceiptList: ["deliveryReceiptList"],
  users: ["users"],
  deliveryDocketNumberLookUp: ["deliveryDocketNumberLookUp"],
  deliveryReciptDetailsByDocketId: ["deliveryReciptDetailsByDocketId"],
  deliveryReciptPayMode: ["deliveryReciptPayMode"],
  deliveryReciptPayHeads: ["deliveryReciptPayHeads"],
  deliveryReciptNoCreation: ["deliveryReciptNoCreation"],
  deliveryReciptPdf: ["deliveryReciptPdf"], // ✅ Add this
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
        console.log("Docket Number Lookup API response:", response?.data.dataValue);
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
      // Check if lastPage is an object with items array or is an array itself
      const items = lastPage?.items || lastPage;
      const itemCount = Array.isArray(items) ? items.length : 0;

      console.log("getNextPageParam - itemCount:", itemCount, "pageSize:", Number(pageSize), "allPages:", allPages.length);

      // If the last page returned fewer items than pageSize, no more pages
      if (itemCount < Number(pageSize)) {
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
          finCode: finCode,
        };

        console.log("API Payload:", params);

        const response = await apiClient.get(`${API_ENDPOINTS.DELIVERY_RECEIPT_DETAILS_BY_DOCKET}?${new URLSearchParams(params).toString()}`);
        console.log("Delivery Receipt Details by Docket ID API response:", response);
        return response?.data?.dataValue || null;
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
      const itemCount = Array.isArray(lastPage) ? lastPage.length : 0;

      console.log("PayHeads getNextPageParam - itemCount:", itemCount, "pageSize: 20", "allPages:", allPages.length);

      if (itemCount < 20) {
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

// Delivery receipt creation -- Get method
export const useGetDeliveryReciptNoCreation = (series, firmCode, branchCode, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.deliveryReciptNoCreation, series, firmCode, branchCode],
    queryFn: async () => {
      try {
        const params = {
          series: series,
          firmCode: firmCode,
          branchCode: branchCode,
        };

        console.log("API Payload:", params);

        const response = await apiClient.get(`${API_ENDPOINTS.AUTO_RECEIPT_NUMBER}?${new URLSearchParams(params).toString()}`);
        console.log("AUTO_RECEIPT_NUMBER API response:", response);
        return response?.data?.dataValue || null;
      } catch (error) {
        console.error("useGetDeliveryReciptNoCreation ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get delivery receipt number");
      }
    },

    enabled: !!series && !!firmCode && !!branchCode,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Submit Delivery recipt (POST request) - Use Mutation
export const useSubmitDeliveryRecipt = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.RECEIPT_SUBMISSION, payload);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          console.log("submitDeliveryRecipt API response:", response);
          return response.data;
        } else {
          // API returned a failure status
          throw new Error(response.data?.status?.message || "Failed to submit delivery receipt");
        }
      } catch (error) {
        console.error("submitDeliveryRecipt ERROR Details:", {
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

        // Handle API error response
        if (error.response?.data?.status?.message) {
          throw new Error(error.response.data.status.message);
        }

        throw new Error(error.message || "Failed to submit delivery receipt");
      }
    },
  });
};

// Delivery receipt pdf download -- Get method
export const useGetDeliveryReceiptPdf = (receiptId, firmCode, finCode, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.deliveryReciptPdf, receiptId, firmCode, finCode],
    queryFn: async () => {
      try {
        const params = {
          firmCode: firmCode,
          finCode: finCode,
        };

        console.log("API Payload:", params);

        const response = await apiClient.get(
          `${API_ENDPOINTS.DELIVERY_RECEIPT_PDF}/${receiptId}/print-pdf?${new URLSearchParams(params).toString()}`,
          {
            responseType: "arraybuffer", // ✅ Required for binary PDF
          }
        );

        console.log("DELIVERY_RECEIPT_PDF API response headers:", response.headers);

        // ✅ Convert arraybuffer to base64 using React Native compatible method
        const uint8Array = new Uint8Array(response.data);
        const chunkSize = 8192;
        let binary = "";
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.subarray(i, i + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        const base64 = btoa(binary);

        return base64;
      } catch (error) {
        console.error("useGetDeliveryReceiptPdf ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get delivery receipt PDF");
      }
    },

    enabled: !!receiptId && !!firmCode && !!finCode,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};
