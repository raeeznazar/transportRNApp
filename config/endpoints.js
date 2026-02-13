import env from "./environment";

// Use relative paths here and let api client `baseURL` (from environment)
// combine with these when making requests. This avoids duplicating the
// base URL in multiple places and reduces the chance of mismatched hosts.
export const API_BASE_URL = env?.API_BASE_URL;
export const API_TIMEOUT = env?.API_TIMEOUT;

export function buildUrl(path) {
  // Accept either a relative path or a full URL
  if (!path) return API_BASE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export const API_ENDPOINTS = {
  // Auth endpoints (relative to api base URL)

  //LOGIN AND LOGOUT
  LOGIN: "/Auth/login",
  LOGOUT: "/Auth/logout",

  //LOGIN SETUP SCREEN
  USER_COMPANIES: "/Auth/user-companies",
  USER_FINANCIAL_YEARS: "/Auth/financial-years",
  PROCEED_DASHBOARD: "/Auth/initialize-session",

  REFRESH_TOKEN: "/Auth/refresh-token",

  // Inward endpoints
  USER_INWARDS_DATA: "/Inward/Inward_GetDetails",
  USER_MANIFEST_ID_LIST: "/Inward/FetchManifestList",
  MANIFEST_TABLE_DATA: "/Inward/FetchManifestDetails",
  INWARDS_REPORT: "/Inward/TruckReport",
  TRUCK_ARRIVAL_SHEET: "/Inward/GetVehiclePayOrderDetails",
  TRUCK_ARRIVAL_SHEET_TABLE: "/Inward/GetTruckArrivalDetails",
  TRUCK_ARRIVAL_SUBMIT: "/Inward/InsertTruckArrivalSheet",
  TRUCK_ARIVAL_LIST: "/Inward/FetchTruckArrivalList",

  //SCAN LIST ENDPOINTS
  DOCKET_SCAN_LIST: "/Inward/FetchTruckArrivalDetails_ScanningList",
  //Insert the scanned data of packets single barcode entry
  INSERT_SCANNING_DATA: "/Inward/InsertScanningDetails",
  //Insert the scanned barcode of damage packets in formdata
  INSERT_DAMAGE_BARCODE_PACKETS: "/Inward/InsertDamagedScanningDetails",
  //Get the shortage missing packets
  GET_SHORTAGE_PACKETS: "/Inward/GetShortageScanningDetails",
  //Enter the shortage missing packets in batch [barcode, reason]
  ENTER_BATCH_SHORTAGE_PACKETS: "/Inward/InsertScanningDetailsBatch",
  //inwards dockets scanning summary header data
  SUMMARY_HEADER_DATA: "/Inward/GetScanningDetailsSummary",
  //inwards dockets scanning summary submit
  SUBMIT_DOCKET_SCAN_SUMMARY: "/Inward/InsertTruckUnloadingDetails",

  // Tracking endpoints
  TRACKING_DOCKET_DETAILS: "/Tracking/GetDocketTracking",

  // OUTWARDS APIs

  //Preloading sheet list
  PRELOADING_SHEET_LIST: "/Outward/PreLoadSheet_GetList",

  //Vechicle list for ALS
  VEHICLE_LIST_FOR_ALS: "/Outward/Vehicles_GetAvailable",

  //Driver list for ALS
  DRIVER_LIST_FOR_ALS: "/Outward/Drivers_GetAvailable",

  //Route list for ALS
  ROUTES_LIST_FOR_ALS: "/Outward/Routes_GetList",

  //Teams list for ALS
  TEAMS_LIST_FOR_ALS: "/Outward/Teams_GetDropdown",

  //Bays list for ALS
  BAYS_LIST_FOR_ALS: "/Outward/Bays_GetDropdown",

  //Godown list for ALS
  GODOWNS_LIST_FOR_ALS: "/Outward/Godowns_GetDropdown",

  //Insert Outwards Actual Loading Sheet
  INSERT_OUTWARDS_ALS: "/Outward/ActualLoadSheetTemp_Insert",

  //Outwades scanning docket list cards
  OUTWARDS_SCANNING_DOCKET_LIST: "/Outward/ActualLoadTempDetails_Get",

  //Insert Outwards Scanning Details
  INSERT_OUTWARDS_SCANNING_DETAILS: "/Outward/ActualLoadScanning_InsertBatch",

  //Outwades get missing packets
  OUTWARDS_MISSING_PACKETS_LIST: "/Outward/MissingBarcodes_Get",

  //Outwades scan damage packets
  OUTWADES_SCAN_DAMAGE_PACKETS: "/Outward/DamagedScanning_InsertBatch",

  //Outwades summary page header data
  OUTWADES_SUMMARY_HEADER_DATA: "/Outward/LoadingSummary_Get",

  //Outwades summary submit
  OUTWADES_SUMMARY_SUBMIT: "/Outward/FinishSubmitActualLoadSheet",

  //Dockets removable screen api for outwades summary
  OUTWADES_DOCKETS_REMOVABLE: "/Outward/RemainingDockets_Get",

  //Dockets removal submit api for outwades summary
  OUTWADES_DOCKETS_REMOVAL_SUBMIT: "/Outward/PreLoadSheet_RemoveDockets",
};
