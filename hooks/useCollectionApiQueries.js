import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";

export const queryKeys = {
  collectionList: ["collectionList"],
  users: ["users"],
};

// Collection list API -- Get method
export const useGetCollectionList = (branchCode, PageSize, options = {}) => {
  const { LedgerFilter, CustomerFilter, ...queryOptions } = options;

  return useInfiniteQuery({
    queryKey: [...queryKeys.collectionList, branchCode, LedgerFilter || "", CustomerFilter || "", Number(PageSize)],
    queryFn: async ({ pageParam }) => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.COLLECTION_LIST_API, {
          params: {
            BranchCode: branchCode, // API expects BranchCode
            ...(LedgerFilter ? { LedgerFilter } : {}),
            ...(CustomerFilter ? { CustomerFilter } : {}),
            PageNumber: pageParam,
            PageSize: Number(PageSize),
          },
        });
        console.log("Collection List API response:", params);
        return response?.data?.data || [];
      } catch (error) {
        console.error("getCollectionList ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        throw new Error(error.response?.data?.message || "Failed to get collection list");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned fewer items than pageSize, no more pages
      if (lastPage.length < PageSize) {
        return undefined;
      }
      // Otherwise, next page number
      return allPages.length + 1;
    },
    enabled: Boolean(branchCode) && Number(PageSize) > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...queryOptions,
  });
};

//Collection pay API. -- Post method

// Insert outwards removal data - Use Mutation - post
export const useOutwadesDirectAlsFinalSubmit = (params) => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.COLLECTION_PAY_API, {
          collectionType: params.collectionType,
          accCode: params.accCode,
          balance: params.balance,
          remarks: params.remarks,
          collectionAmount: params.collectionAmount,
          paymentMode: params.paymentMode,
          isCheque: params.isCheque,
          chequeNo: params.chequeNo,
          chequePassed: params.chequePassed,
          passDate: params.passDate,
          branchCode: params.branchCode,
          finCode: params.finCode,
          entryUser: params.entryUser,
          sessionCode: params.sessionCode,
          collectionDate: params.collectionDate,
        });
        // Check if the API returned success
        if (response.data?.success) {
          return response.data;
        } else {
          throw new Error(response.data?.message || "Failed to submit collection payment");
        }
      } catch (error) {
        console.error("submitCollectionPayment ERROR:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        // Re-throw with the correct error message path
        throw new Error(
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit collection payment"
        );
      }
    },
  });
};
