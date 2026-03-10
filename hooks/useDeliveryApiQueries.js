import { useInfiniteQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";

export const queryKeys = {
  deliveryReceiptList: ["deliveryReceiptList"],
  users: ["users"],
};

// Delivery Receipt list API -- Get method
export const useGetDeliveryReceiptList = (finCode, branchCode, rcptType, fromDate, toDate, pageSize, sortColumn, sortDirection, options = {}) => {
  const { searchText, ...queryOptions } = options;
  return useInfiniteQuery({
    queryKey: [
      ...queryKeys.deliveryReceiptList,
      finCode,
      branchCode,
      rcptType,
      fromDate,
      toDate,
      searchText,
      Number(pageSize),
      sortColumn,
      sortDirection,
    ],
    queryFn: async ({ pageParam }) => {
      try {
        const params = {
          FinCode: finCode,
          RcptType: rcptType,
          FromDate: fromDate,
          ToDate: toDate,
          SearchText: searchText,
          PageNumber: pageParam,
          PageSize: Number(pageSize),
          SortColumn: sortColumn,
          SortDirection: sortDirection,
        };

        console.log("API Payload:", params);

        const response = await apiClient.post(API_ENDPOINTS.DELIVERY_RECEIPT_LIST_API, {
          params,
        });
        console.log("Delivery Receipt List API response:", response);
        return response?.data?.data || [];
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
    enabled: Boolean(finCode) && Boolean(branchCode) && rcptType && Number(pageSize) > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...queryOptions,
  });
};
