import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "../config/endpoints";
import apiClient from "../services/apiService";
// Query Keys - centralized for cache management
export const queryKeys = {
  inward: ["inward"],
  users: ["users"],
  manifests: ["manifests"],
  manifestsTable: ["manifestsTable"],
  inwardsReport: ["inwardsReport"],
  truckArrivalSheetHeader: ["truckArrivalSheetHeader"],
  truckArrivalSheetTable: ["truckArrivalSheetTable"],
  truckArivalListAfterReport: ["truckArivalListAfterReport"],
  docketScanList: ["docketScanList"],
  shortagePacketList: ["shortagePacketList"],
  barcodeSubmitSummaryHeader: ["barcodeSubmitSummaryHeader"],
  // Add more query keys based on your screensApiService
};

// Fetch user inwards data
export const useGetInward = (branchCode, fromDate, toDate, options = {}) => {
  console.log("useGetInward Params:", { branchCode, fromDate, toDate });
  return useQuery({
    queryKey: [...queryKeys.inward, branchCode, fromDate, toDate],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.USER_INWARDS_DATA, {
          params: {
            branchCode,
            fromDate,
            toDate,
          },
        });
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
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (gcTime replaces cacheTime in newer React Query)
    ...options, // Spread any additional options passed from the component
  });
};

// Fetch user manifest ID list data
export const useGetManifestIdList = (thcId, toStation) => {
  return useQuery({
    queryKey: [...queryKeys.manifests, thcId, toStation],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.USER_MANIFEST_ID_LIST, {
          params: {
            thcId,
            toStation,
          },
        });
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
  return useQuery({
    queryKey: [...queryKeys.manifestsTable, manID],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.MANIFEST_TABLE_DATA, {
          params: {
            manId: manID,
          },
        });
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

// Submit inwards report (POST request) - Use Mutation
export const useSubmitInwardsReport = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.INWARDS_REPORT, payload);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          // API returned a failure status
          throw new Error(response.data?.status?.message || "Failed to submit inwards report");
        }
      } catch (error) {
        console.error("submitInwardsReport ERROR Details:", {
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

        throw new Error(error.message || "Failed to submit inwards report");
      }
    },
  });
};

// Fetch user truck arrival sheet header data
export const useGetTruckArrivalSheetHeader = (thcId) => {
  return useQuery({
    queryKey: [...queryKeys.truckArrivalSheetHeader, thcId],
    queryFn: async () => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.TRUCK_ARRIVAL_SHEET, {
          thcId: thcId,
        });
        return response.data.dataValue[0];
      } catch (error) {
        console.error("getTruckArrivalSheetHeader ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get Truck Arrival Sheet Header");
      }
    },
    enabled: !!thcId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};

// Fetch user truck arrival sheet table data
export const useGetTruckArrivalSheetTable = (thcId) => {
  return useQuery({
    queryKey: [...queryKeys.truckArrivalSheetTable, thcId],
    queryFn: async () => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.TRUCK_ARRIVAL_SHEET_TABLE, {
          thcId: thcId,
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("getTruckArrivalSheetTable ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get Truck Arrival Sheet Table");
      }
    },
    enabled: !!thcId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};

// Submit truck arrival sheet (POST request) - Use Mutation
export const useSubmitTruckArrivalSheet = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.TRUCK_ARRIVAL_SUBMIT, payload);

        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit truck arrival sheet");
        }
      } catch (error) {
        console.error("submitTruckArrivalSheet ERROR Details:", {
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
        throw new Error(error.message || "Failed to submit truck arrival sheet");
      }
    },
  });
};

// Fetch truck arrival list data after report in truck arival sub menu
export const useGetTruckArrivalListAfterReport = (branchCode, fromDate, toDate, options = {}) => {
  console.log("useGetTruckArrivalListAfterReport Params:", { branchCode, fromDate, toDate });
  return useQuery({
    queryKey: [...queryKeys.truckArivalListAfterReport, branchCode, fromDate, toDate],
    queryFn: async () => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.TRUCK_ARIVAL_LIST, {
          branchCode: branchCode,
          fromDate: fromDate,
          toDate: toDate,
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("getTruckArrivalListAfterReport ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get Truck Arrival List After Report");
      }
    },
    enabled: !!branchCode && !!fromDate && !!toDate,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (gcTime replaces cacheTime in newer React Query)
    ...options,
  });
};

//Fetch Docket Scan List Screen

export const useGetDocketScanList = (branchCode, thcid) => {
  return useQuery({
    queryKey: [...queryKeys.docketScanList, branchCode, thcid],
    queryFn: async () => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.DOCKET_SCAN_LIST, {
          branchCode: branchCode,
          thcid: thcid,
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("getTruckArrivalListAfterReport ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get Truck Arrival List After Report");
      }
    },
    enabled: !!branchCode && !!thcid,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};

// Submit Docket Scanning data Serial number
export const useInsertScanningData = () => {
  return useMutation({
    mutationFn: async (scanData) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.INSERT_SCANNING_DATA, {
          thcid: scanData.thcid,
          branchCode: scanData.branchCode,
          barcode: scanData.barcode,
        });
        console.log("✅ Insert Scanning Data Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        // console.error("insertScanningData ERROR Details:", {
        //   status: error.response?.status,
        //   statusText: error.response?.statusText,
        //   data: error.response?.data,
        //   message: error.message,
        //   config: {
        //     url: error.config?.url,
        //     method: error.config?.method,
        //     baseURL: error.config?.baseURL,
        //   },
        // });
        // Re-throw with the correct error message path
        throw new Error(error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to insert scanning data");
      }
    },
  });
};

export const useGetShortagePacketList = (thcid, branchCode, docketID) => {
  console.log("useGetShortagePacketList Params:", { thcid, branchCode, docketID });
  return useQuery({
    queryKey: [...queryKeys.shortagePacketList, thcid, branchCode, docketID],
    queryFn: async () => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.GET_SHORTAGE_PACKETS, {
          thcid: thcid,
          branchCode: branchCode,
          docketID: docketID,
          remarks: null,
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("getTruckArrivalListAfterReport ERROR Details:", {
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
        throw new Error(error.response?.data?.status?.message || "Failed to get Truck Arrival List After Report");
      }
    },
    enabled: !!thcid && !!branchCode && !!docketID,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};

// Submit Missing Packets with Reasons batch [{barcode , remarks}]
export const useSubmitMissingPackets = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.ENTER_BATCH_SHORTAGE_PACKETS, payload);
        return response.data;
      } catch (error) {
        console.error("submitMissingPackets ERROR Details:", {
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
        // Re-throw with the correct error message path
        throw new Error(
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit missing packets"
        );
      }
    },
  });
};

// Fetch barcode submit summary header data
export const useGetBarcodeSubmitSummaryHeader = (thcid, branchCode) => {
  return useQuery({
    queryKey: [...queryKeys.barcodeSubmitSummaryHeader, thcid, branchCode],
    queryFn: async () => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.SUMMARY_HEADER_DATA, {
          thcid: thcid,
          branchCode: branchCode,
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("getTruckArrivalListAfterReport ERROR Details:", {
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
        throw new Error(error.response?.data?.status?.message || "Failed to get Truck Arrival List After Report");
      }
    },
    enabled: !!thcid && !!branchCode,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 1,
  });
};

// Submit Damage Scanning data with photos (FormData)
export const useInsertDamageScanningData = () => {
  return useMutation({
    mutationFn: async (formData) => {
      try {
        console.log("Submitting Damage Scanning Data with FormData:", formData);

        const response = await apiClient.post(API_ENDPOINTS.INSERT_DAMAGE_BARCODE_PACKETS, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("✅ Insert Damage Scanning Data Response:", response.data);

        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit damage scanning data");
        }
      } catch (error) {
        console.error("insertDamageScanningData ERROR Details:", {
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

        // Re-throw with the correct error message path
        throw new Error(
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to insert damage scanning data"
        );
      }
    },
  });
};

// Submit Final Docket Scan Summary (POST request) - Use Mutation
export const useFinalSubmitData = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        console.log("Submitting Final Data with params:", params);

        const response = await apiClient.post(API_ENDPOINTS.SUBMIT_DOCKET_SCAN_SUMMARY, params);

        console.log("✅ Final Submit Data Response:", response.data);

        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit final data");
        }
      } catch (error) {
        console.error("useFinalSubmitData ERROR Details:", {
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

        // Re-throw with the correct error message path
        throw new Error(error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit final data");
      }
    },
  });
};
