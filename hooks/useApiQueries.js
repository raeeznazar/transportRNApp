import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef } from "react";
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
  trackingDocketDetails: ["trackingDocketDetails"],
  preloadingList: ["preloadingList"],
  vehicleListForALS: ["vehicleListForALS"],
  driverListForALS: ["driverListForALS"],
  routeListForALS: ["routeListForALS"],
  teamsListForALS: ["teamsListForALS"],
  baysListForALS: ["baysListForALS"],
  godownsListForALS: ["godownsListForALS"],
  outwardsScanningDocketListForALS: ["outwardsScanningDocketListForALS"],
  outwardsGetMissingPackets: ["outwardsGetMissingPackets"],
  outwardsSummaryHeaderData: ["outwardsSummaryHeaderData"],
  outwardsSummaryRemainingDockets: ["outwardsSummaryRemainingDockets"],
  getOutwadesDirectALSList: ["getOutwadesDirectALSList"],
  getAlsDocketSummaryDetails: ["getAlsDocketSummaryDetails"],
  getAlsDirectSummaryModalCheck: ["getAlsDirectSummaryModalCheck"],
  getAlsDetailsForSelected: ["getAlsDetailsForSelected"],
  // Add more query keys based on your screensApiService
};

// Custom hook for auto-refetching queries on screen focus with interval
export const useAutoRefetchQuery = (queryHook, params, intervalMs = 1 * 60 * 1000) => {
  const intervalRef = useRef(null);
  const { refetch, ...queryResult } = queryHook(...params);

  useFocusEffect(
    useCallback(() => {
      // Refetch immediately when screen comes into focus
      refetch();

      // Set up interval to refetch every intervalMs
      intervalRef.current = setInterval(() => {
        refetch();
      }, intervalMs);

      // Cleanup: clear interval when screen loses focus
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [...params, refetch, intervalMs])
  );

  return { refetch, ...queryResult };
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 4 * 60 * 1000, // 4 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
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
    staleTime: 0, // 3 minutes
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//Fetch Docket Scan List Screen

export const useGetDocketScanList = (branchCode, thcid, options = {}) => {
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Submit Docket Scanning data Serial number normal scanning
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

export const useGetShortagePacketList = (thcid, branchCode, docketID, options = {}) => {
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Submit Missing Packets with Reasons batch [{barcode , remarks}]
export const useSubmitMissingPackets = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.ENTER_BATCH_SHORTAGE_PACKETS, payload);
        console.log("✅ Submit Missing Packets Response:", response.data);
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

// Fetch barcode submit summary header data - post
export const useGetBarcodeSubmitSummaryHeader = (thcid, branchCode, options = {}) => {
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
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 3 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Submit Damage Scanning data with photos (FormData)
export const useInsertDamageScanningData = () => {
  return useMutation({
    mutationFn: async (formData) => {
      try {
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
        throw new Error(
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to insert damage scanning data"
        );
      }
    },
  });
};

// Submit Final Docket Scan Summary (POST request) - Use Mutation - post
export const useFinalSubmitData = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.SUBMIT_DOCKET_SCAN_SUMMARY, params);
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

// API to get tracking docket details - get
export const useGetTrackingDocketDetails = (docketNo) => {
  const cleanedDocketNo = String(docketNo ?? "").trim();

  return useQuery({
    queryKey: [...queryKeys.trackingDocketDetails, cleanedDocketNo],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.TRACKING_DOCKET_DETAILS, {
          params: {
            docketNo: cleanedDocketNo,
          },
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("getTrackingDocketDetails ERROR Details:", {
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
        throw new Error(error.response?.data?.message || "Failed to get tracking docket details");
      }
    },
    enabled: cleanedDocketNo.length > 0,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
  });
};

//API to get Preloading Sheet List - get
export const useGetPreloadingList = (branchCode, finCode, includeAll = false, options = {}) => {
  console.log("useGetPreloadingList Params:", { branchCode, finCode, includeAll });

  return useQuery({
    queryKey: [...queryKeys.preloadingList, branchCode, finCode, includeAll],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.PRELOADING_SHEET_LIST, {
          params: {
            branchCode,
            finCode,
            includeAll,
          },
        });
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get preloading list");
      }
    },
    enabled: !!branchCode && !!finCode,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 30000, // 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//API to get vechicle No List for ALS - get
export const useGetVehicleListForALS = (branchCode, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.vehicleListForALS, branchCode],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.VEHICLE_LIST_FOR_ALS, {
          params: {
            branchCode,
          },
        });
        return response.data.dataValue;
      } catch (error) {
        console.error("VEHICLE_LIST_FOR_ALS ERROR:", error.response?.data);
        throw new Error(error.response?.data?.message || "Failed to get vehicle list for ALS");
      }
    },
    enabled: !!branchCode,
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect cached data
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//API to get driver List for ALS - get
export const useGetDriverListForALS = (branchCode, options = {}) => {
  console.log("useGetDriverListForALS Params:", { branchCode });

  return useQuery({
    queryKey: [...queryKeys.driverListForALS, branchCode],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.DRIVER_LIST_FOR_ALS, {
          params: {
            branchCode,
          },
        });
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get driver list for ALS");
      }
    },
    enabled: !!branchCode,
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect cached data
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//API to get Route List for ALS - get
export const useGetRouteListForALS = (options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.routeListForALS],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.ROUTES_LIST_FOR_ALS);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get routes list for ALS");
      }
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect cached data
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//API to get Teams List for ALS - get
export const useGetTeamsListForALS = (options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.teamsListForALS],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.TEAMS_LIST_FOR_ALS);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get teams list for ALS");
      }
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect cached data
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//API to get Bays List for ALS - get
export const useGetBaysListForALS = (options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.baysListForALS],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.BAYS_LIST_FOR_ALS);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get bays list for ALS");
      }
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect cached data
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//API to get Godowns List for ALS - get
export const useGetGodownsListForALS = (options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.godownsListForALS],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.GODOWNS_LIST_FOR_ALS);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get godowns list for ALS");
      }
    },
    staleTime: Infinity, // Never consider data stale
    gcTime: Infinity, // Never garbage collect cached data
    refetchInterval: false, // Disable automatic refetching
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Submit Outwades ALS Data - Use Mutation - post
export const useOutwadesAlsSubmit = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.INSERT_OUTWARDS_ALS, params);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit outwades ALS data");
        }
      } catch (error) {
        console.error("useOutwadesAlsSubmit ERROR Details:", {
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
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit outwades ALS data"
        );
      }
    },
  });
};

//API to get docket list for Outwards sacnning - get
export const useGetOutwardsScanningDocketListForALS = (branchCode, altId, options = {}) => {
  console.log("useGetOutwardsScanningDocketListForALS Params:", { branchCode, altId });
  return useQuery({
    queryKey: [...queryKeys.outwardsScanningDocketListForALS, branchCode, altId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWARDS_SCANNING_DOCKET_LIST, {
          params: {
            branchCode,
            altId,
          },
        });
        console.log("OUTWARDS_SCANNING_DOCKET_LIST Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get godowns list for ALS");
      }
    },
    enabled: !!branchCode && !!altId,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Insert outwards Scanning data - Use Mutation - post
export const useOutwadesScanningSubmit = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.INSERT_OUTWARDS_SCANNING_DETAILS, params);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit outwades ALS data");
        }
      } catch (error) {
        console.error("useOutwadesAlsSubmit ERROR Details:", {
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
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit outwades ALS data"
        );
      }
    },
  });
};

//API to get docket list for Outwards sacnning - get
export const useGetOutwardsGetMissingPackets = (docketId, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.outwardsGetMissingPackets, docketId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWARDS_MISSING_PACKETS_LIST, {
          params: {
            docketId,
          },
        });
        console.log("OUTWARDS_SCANNING_DOCKET_LIST Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get missing packets for ALS");
      }
    },
    enabled: !!docketId,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Submit Damage Scanning data with photos (FormData)
export const useInsertOutwadesDamageScanningData = () => {
  return useMutation({
    mutationFn: async (formData) => {
      console.log("Submitting Outwards Damage Scanning Data with FormData:", formData);
      try {
        const response = await apiClient.post(API_ENDPOINTS.OUTWADES_SCAN_DAMAGE_PACKETS, formData, {
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
        throw new Error(
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to insert damage scanning data"
        );
      }
    },
  });
};

//submit outwades missing packets with reasons batch (Add missing packets outwades) -post
export const useOutwadesSubmitAddMissingPackets = () => {
  return useMutation({
    mutationFn: async (payload) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.INSERT_OUTWARDS_SCANNING_DETAILS, payload);
        console.log("✅ Submit Missing Packets Response:", response.data);
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

//Get outwades summary header data - get
export const useGetOutwardsSummaryHeaderData = (altId, options = {}) => {
  console.log("useGetOutwardsSummaryHeaderData Params:", { altId });
  return useQuery({
    queryKey: [...queryKeys.outwardsSummaryHeaderData, altId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWADES_SUMMARY_HEADER_DATA, {
          params: {
            altId,
          },
        });
        console.log("useGetOutwardsSummaryHeaderData Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get godowns list for ALS");
      }
    },
    enabled: !!altId,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Insert outwards Scanning data - Use Mutation - post
export const useOutwadesSummarySubmit = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.OUTWADES_SUMMARY_SUBMIT, params);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit outwades summary data");
        }
      } catch (error) {
        console.error("useOutwadesSummarySubmit ERROR Details:", {
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
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit outwades ALS data"
        );
      }
    },
  });
};

//Get outwades summary remaining dockets - get
export const useGetOutwardsSummaryRemainingDockets = (altId, options = {}) => {
  console.log("outwardsSummaryRemainingDockets Params:", { altId });
  return useQuery({
    queryKey: [...queryKeys.outwardsSummaryRemainingDockets, altId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWADES_DOCKETS_REMOVABLE, {
          params: {
            altId,
          },
        });
        console.log("useGetOutwardsSummaryRemainingDockets Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get remaining dockets for ALS");
      }
    },
    enabled: !!altId,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Insert outwards removal data - Use Mutation - post
export const useOutwadesDocketsRemovalSubmit = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.OUTWADES_DOCKETS_REMOVAL_SUBMIT, params);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit outwades summary data");
        }
      } catch (error) {
        console.error("useOutwadesSummarySubmit ERROR Details:", {
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
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit outwades ALS data"
        );
      }
    },
  });
};

//Get outwades Get Out wades Direct ALS List - get
export const useGetOutwadesDirectALSList = (branchCode, options = {}) => {
  console.log("useGetOutwadesDirectALSList Params:", { branchCode });
  return useQuery({
    queryKey: [...queryKeys.getOutwadesDirectALSList, branchCode],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWADES_DIRECT_ALS_LIST, {
          params: {
            branchCode,
          },
        });
        console.log("useGetOutwadesDirectALSList Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get direct ALS list");
      }
    },
    enabled: !!branchCode,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: 30000, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//Get outwades Als Docket Summary Details- get
export const useGetAlsDocketSummaryDetails = (docketId, options = {}) => {
  console.log("useGetAlsDocketSummaryDetails Params:", { docketId });
  return useQuery({
    queryKey: [...queryKeys.getAlsDocketSummaryDetails, docketId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWADES_ALS_DOCKETSUMMARY_DETAILS, {
          params: {
            docketId,
          },
        });
        console.log("useGetAlsDocketSummaryDetails Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to get ALS docket summary details");
      }
    },
    enabled: !!docketId,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: false, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

//Get outwades Als Docket Summary modal check- get
export const useGetAlsDirectSummaryModalCheck = (altId, branchCode, options = {}) => {
  console.log("useGetAlsDirectSummaryModalCheck Params:", { altId, branchCode });
  return useQuery({
    queryKey: [...queryKeys.getAlsDirectSummaryModalCheck, altId, branchCode],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWADES_DIRECT_ALS_CHECK_MODAL, {
          params: {
            altId,
            branchCode,
          },
        });
        console.log("useGetAlsDirectSummaryModalCheck Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        console.log(response);
        throw new Error(error.response?.data?.message || "Failed to get Direct ALS Summary Modal Check");
      }
    },
    enabled: !!altId && !!branchCode,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: false, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};

// Insert outwards removal data - Use Mutation - post
export const useOutwadesDirectAlsFinalSubmit = () => {
  return useMutation({
    mutationFn: async (params) => {
      try {
        const response = await apiClient.post(API_ENDPOINTS.OUTWADES_DIRECT_ALS_FINAL_SUBMIT, params);
        // Check if the API returned success
        if (response.data?.status?.isSuccess) {
          return response.data;
        } else {
          throw new Error(response.data?.status?.message || "Failed to submit outwades direct ALS data");
        }
      } catch (error) {
        // Re-throw with the correct error message path
        throw new Error(
          error.response?.data?.status?.message || error.response?.data?.message || error.message || "Failed to submit outwades ALS data"
        );
      }
    },
  });
};

//Get outwades Als Details for select ALS- get
export const useGetAlsDetailsForSelectALS = (plsId, options = {}) => {
  console.log("useGetAlsDetailsForSelectALS Params:", { plsId });
  return useQuery({
    queryKey: [...queryKeys.getAlsDetailsForSelected, plsId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.OUTWADES_ENTRY_SCREEN_ALS_DETAILS, {
          params: {
            plsId,
          },
        });
        console.log("useGetAlsDetailsForSelectALS Response:", response.data);
        return response.data.dataValue;
      } catch (error) {
        console.log(response);
        throw new Error(error.response?.data?.message || "Failed to get Direct ALS Summary Modal Check");
      }
    },
    enabled: !!plsId,
    staleTime: 0, // Override global - always stale
    gcTime: 0, // Override global - no cache
    refetchInterval: false, // 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    retry: 1,
    ...options,
  });
};
