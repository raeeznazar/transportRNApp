import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import * as Print from "expo-print";
import { Printer } from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, InteractionManager, Platform, StatusBar, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useGetDeliveryPayHeads,
  useGetDeliveryPayMode,
  useGetDeliveryReceiptPdf,
  useGetDeliveryReciptDetailsByDocketId,
  useGetDeliveryReciptNoCreation,
  useGetDocketNumberLookup,
  useSubmitDeliveryRecipt,
} from "../../../hooks/useDeliveryApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import BottomActionBar from "../../components/BottomActionBar";
import { Button } from "../../components/Button";
import CalendarInput from "../../components/CalendarInput";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import { ScanToast } from "../../components/ScanToast";
import ScrollSearchFlatlist from "../../components/ScrollSearchFlatlist";
import TimeInput from "../../components/TimeInput";

/* ------------------------------------------------------------------ */
/*  Static option lists                                               */
/* ------------------------------------------------------------------ */

const PAY_MODE_OPTIONS = [
  { label: "CASH", value: "CASH" },
  { label: "CHEQUE", value: "CHEQUE" },
  { label: "CREDIT", value: "CREDIT" },
];

const RECEIPT_TYPE_OPTIONS = [
  { label: "DDST", value: "ddst" },
  { label: "Godown", value: "godown" },
  { label: "Door Delivery", value: "door" },
];

const IDENTITY_TYPE_OPTIONS = [
  { label: "Aadhaar Card", value: "aadhaar" },
  { label: "PAN Card", value: "pan" },
  { label: "Passport", value: "passport" },
  { label: "Driving Licence", value: "driving" },
];

/* ------------------------------------------------------------------ */
/*  Section Header                                                       */
/* ------------------------------------------------------------------ */
const SectionHeader = ({ iconName, title, colors }) => (
  <View style={[sectionStyles.row, { borderBottomColor: colors.cardBorder }]}>
    <View style={[sectionStyles.iconWrap, { backgroundColor: colors.primary + "18" }]}>
      <Ionicons name={iconName} size={16} color={colors.primary} />
    </View>
    <Text style={[sectionStyles.title, { color: colors.primary }]}>{title}</Text>
  </View>
);

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 13,

    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

/* ------------------------------------------------------------------ */
/*  Docket Modal - Memoized to prevent re-renders                      */
/* ------------------------------------------------------------------ */
const DocketModal = memo(
  ({
    visible,
    onClose,
    onSelect,
    docketData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore,
    onRefresh,
    refreshing,
    error,
    onRetry,
    searchValue,
    onSearchChange,
  }) => {
    return (
      <ScrollSearchFlatlist
        visible={visible}
        onClose={onClose}
        data={docketData}
        onSelect={onSelect}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        labelKey="docketNo"
        valueKey="docketNo"
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
        onRefresh={onRefresh}
        refreshing={refreshing}
        title="Select Docket"
        searchPlaceholder="Search dockets..."
        error={error}
        onRetry={onRetry}
      />
    );
  }
);

/* ------------------------------------------------------------------ */
/*  Pay Head Modal - Memoized to prevent re-renders                    */
/* ------------------------------------------------------------------ */
const PayHeadModal = memo(
  ({
    visible,
    onClose,
    onSelect,
    payHeadsData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    onLoadMore,
    onRefresh,
    refreshing,
    error,
    onRetry,
    searchValue,
    onSearchChange,
  }) => {
    return (
      <ScrollSearchFlatlist
        visible={visible}
        onClose={onClose}
        data={payHeadsData}
        onSelect={onSelect}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        labelKey="head"
        valueKey="head"
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
        onRefresh={onRefresh}
        refreshing={refreshing}
        title="Select Pay Cash Ledger"
        searchPlaceholder="Search cash ledgers..."
        error={error}
        onRetry={onRetry}
      />
    );
  }
);

/* ------------------------------------------------------------------ */
/*  Main Screen                                                          */
/* ------------------------------------------------------------------ */
export default function CreateDeliveryReceiptEntry({ navigation }) {
  const { theme } = useThemeStore();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  /* ---- form state ---- */
  const [docketId, setDocketId] = useState(""); // This is the ID for API calls
  const [docketNo, setDocketNo] = useState(""); // This is the number for display
  const [customer, setCustomer] = useState("");

  const [gcCharge, setGcCharge] = useState("00.00");
  const [deliveryCharge, setDeliveryCharge] = useState("00.00");
  const [hamaly, setHamaly] = useState("00.00");
  const [otherCharges, setOtherCharges] = useState("25.00");

  const [payMode, setPayMode] = useState("CASH");
  const [receiptType, setReceiptType] = useState("DOOR");
  const [toAccount, setToAccount] = useState("main_a");
  const [chequeNo, setChequeNo] = useState("");
  const [narration, setNarration] = useState("");

  const [deliveredTo, setDeliveredTo] = useState("");
  const [identityType, setIdentityType] = useState("aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [doorDelivery, setDoorDelivery] = useState("0.00");
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payHeadRefreshing, setPayHeadRefreshing] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date());
  const [customerMobileNumber, setCustomerMobileNumber] = useState("");
  const [allowedCredit, setAllowedCredit] = useState(false);
  const [creditLimit, setCreditLimit] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [customerBranch, setCustomerBranch] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [deliveryReceiptDetailsLoading, setDeliveryReceiptDetailsLoading] = useState(false);
  const [cashLedger, setCashLedger] = useState("");
  const [cashLedgerCode, setCashLedgerCode] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [freightCharge, setFreightCharge] = useState("0.00");
  const [aCCCodeFOREcredit, setACCCodeFOREcredit] = useState("");
  const [printBtnLoading, setPrintBtnLoading] = useState(false);
  const pageSize = 20;
  const isFocused = useIsFocused();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const finCode = sessionData?.finCode;
  const coFinCode = sessionData?.coFinCode;
  const userId = sessionData?.userName;

  const firmCode = "0001";
  const rcptType = "DOOR";
  const entryDate = date;
  const [payHeadModalVisible, setPayHeadModalVisible] = useState(false);
  const [allowedCreditLimit, setAllowedCreditLimit] = useState(0);
  const [creditAccount, setCreditAccount] = useState("");
  const [rcptStatus, setRcptStatus] = useState("DELIVERED");
  const [rptNo, setRcptNo] = useState("0");
  const [savedReceiptId, setSavedReceiptId] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);
  const series = branchCode;
  const [payModeCode, setPayModeCode] = useState("1"); // Add this line
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  // Search states for server-side filtering
  const [docketSearch, setDocketSearch] = useState("");
  const [payHeadSearch, setPayHeadSearch] = useState("");

  // Debounced search values
  const debouncedDocketSearch = useDebounce(docketSearch, 500);
  const debouncedPayHeadSearch = useDebounce(payHeadSearch, 500);
  const getSevenDaysAgo = () => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    return sevenDaysAgo.toISOString().split("T")[0];
  };

  //------------------DELIVERY RECEIPT SUBMISSION-------------------//
  const { mutate: submitDeliveryRecipt, isPending: isSubmitting } = useSubmitDeliveryRecipt();

  ///----------------------API CALL FOR AUTO GENERATION OF DELIVERY RECEIPT NUMBER-------------------------///

  const {
    data: autoReceiptNumber,
    isLoading: autoReceiptNumberLoading,
    refetch: autoReceiptNumberRefetch,
  } = useGetDeliveryReciptNoCreation(series, firmCode, branchCode, {
    enabled: isFocused && !!series && !!branchCode && !!firmCode,
    docketNoFilter: debouncedDocketSearch,
    staleTime: 0,
    cacheTime: 30 * 60 * 1000,
  });

  // Store auto-generated receipt number in state
  useEffect(() => {
    if (autoReceiptNumber) {
      setRcptNo(autoReceiptNumber);
    }
  }, [autoReceiptNumber]);

  ///----------------------API CALL FOR AUTO GENERATION OF DELIVERY RECEIPT NUMBER-------------------------///

  ///----------------------API CALLS FOR DOCKET NUMBER LOOKUP-------------------------///
  const {
    data: docketData,
    isLoading: docketisLoading,
    isFetching: docketisFetching,
    refetch: docketRefetch,
    error: docketError,
    fetchNextPage: docketFetchNextPage,
    hasNextPage: docketHasNextPage,
    isFetchingNextPage: docketIsFetchingNextPage,
  } = useGetDocketNumberLookup(entryDate, branchCode, rcptType, firmCode, pageSize, {
    enabled: modalVisible && isFocused && !!entryDate && !!branchCode && !!rcptType && !!firmCode,
    docketNoFilter: debouncedDocketSearch,
    staleTime: 0,
    cacheTime: 10 * 60 * 1000,
  });

  const docketDataFlat = useMemo(() => {
    if (!docketData?.pages) return [];

    const flattened = docketData.pages.flatMap((page, pageIndex) => {
      // Handle both array and object with items property
      const items = page?.items || (Array.isArray(page) ? page : []);
      return items.map((item, itemIndex) => ({
        ...item,
        uniqueKey: `${pageIndex}-${itemIndex}-${item.docketID}-${item.docketNo}`,
      }));
    });

    return flattened;
  }, [docketData]);

  ///----PAGINATION LOGIC FOR DOCKET NUMBER LOOKUP FLATLIST---
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await docketRefetch();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, [docketRefetch]);

  const handleLoadMore = useCallback(() => {
    if (docketHasNextPage && !docketIsFetchingNextPage && !docketisLoading) {
      docketFetchNextPage();
    }
  }, [docketHasNextPage, docketIsFetchingNextPage, docketFetchNextPage, docketisLoading]);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setDocketSearch(""); // Clear search on close
  }, []);

  const handleOpenModal = useCallback(() => {
    setDocketSearch(""); // Clear search when opening
    setModalVisible(true);
  }, []);

  const handleRetry = useCallback(() => {
    docketRefetch();
  }, [docketRefetch]);

  ///------DOCKET LOOKUP PAGINATION END-------///

  ///--------------------API CALLS FOR DOCKET NUMBER LOOKUP END------------------------///

  ///----------------------API CALLS FOR DOCKET FOR BINDING DATA-------------------------///
  const handleDocketSelect = useCallback((item) => {
    // Close modal and clear search immediately so animation starts
    setDocketNo(String(item.docketNo || ""));
    setModalVisible(false);
    setDocketSearch("");
    // Defer the API-triggering state update until after the modal close animation
    InteractionManager.runAfterInteractions(() => {
      setDocketId(String(item.docketID || ""));
    });
  }, []);

  // DELIVERY RECEIPT DETAILS API Call when docketId changes
  const {
    data: deliveryReceiptDetails,
    isLoading: deliveryReceiptDetailsLoadingData,
    error: deliveryReceiptDetailsError,
  } = useGetDeliveryReciptDetailsByDocketId(docketId, firmCode, finCode, {
    enabled: !!docketId && !!firmCode && !!finCode, // Only runs when docketId exists
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
  // Sync loading state
  useEffect(() => {
    setDeliveryReceiptDetailsLoading(deliveryReceiptDetailsLoadingData);
  }, [deliveryReceiptDetailsLoadingData]);
  // Auto-populate form when delivery receipt details are loaded
  useEffect(() => {
    if (deliveryReceiptDetails) {
      console.log("Customer Details:", deliveryReceiptDetails);
      // Update form fields with the API response data
      const customer = deliveryReceiptDetails;

      // Batch all state updates together to avoid multiple re-renders
      setCustomer(customer?.custName || "");
      setCustomerMobileNumber(customer?.mobile || customer?.phone || "");
      setCreditLimit(customer?.creditLimit || 0);
      setCustomerId(customer?.custId || "");
      setCustomerBranch(customer?.branchCode || "");
      setAllowedCredit(customer?.allowCredit || false);
      setAllowedCreditLimit(customer?.creditLimit || 0);
      setCreditAccount(customer?.accName || "");
      setCustomerAddress(customer?.address || "");
      setFreightCharge(customer?.freight || 0);
      setACCCodeFOREcredit(customer?.accCode || "");
      // setDate(customer?.entryDate ? customer.entryDate.split("T")[0] : new Date().toISOString().split("T")[0]);
      setCustomerCode(customer?.consigneeID);

      // setDeliveryCharge(receipt?.stnryCharge ? String(receipt.stnryCharge.toFixed(2)) : "0.00");
      // setHamaly(receipt?.hamali ? String(receipt.hamali.toFixed(2)) : "0.00");
      // setGcCharge(receipt?.totalAmount ? String(receipt.totalAmount.toFixed(2)) : "0.00");

      // Set pay mode to CREDIT if credit is allowed
      if (customer?.allowCredit) {
        setPayMode("CREDIT");
      }
    }
  }, [deliveryReceiptDetails]);

  ///----------------------API CALLS FOR DOCKET FOR BINDING DATA END-------------------------///

  ///----------------------API CALLS FOR PAYMENT MODES-------------------------///
  const {
    data: paymentModes,
    isLoading: paymentModesLoading,
    error: paymentModesError,
  } = useGetDeliveryPayMode(firmCode, finCode, {
    enabled: !!firmCode && !!finCode,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  const toPayModeOptions = useMemo(() => {
    // normalize API response
    const list = Array.isArray(paymentModes) ? paymentModes : Array.isArray(paymentModes?.dataValue) ? paymentModes.dataValue : [];

    const apiOptions = list
      .map((item) => ({
        label: item?.head?.trim?.() || "",
        value: item?.head?.trim?.() || "",
        code: item?.code || "",
      }))
      .filter((x) => x.label && x.value);

    // fallback to static options if API has nothing
    return apiOptions.length > 0 ? apiOptions : PAY_MODE_OPTIONS;
  }, [paymentModes]);

  ///----------------------API CALLS FOR PAYMENT MODES END-------------------------///

  ///----------------------PAYMENT HEADES API CALLS------------------------///
  const {
    data: payHeadsData,
    isLoading: payHeadsLoading,
    error: payHeadsError,
    fetchNextPage: payHeadsFetchNextPage,
    hasNextPage: payHeadsHasNextPage,
    isFetchingNextPage: payHeadsIsFetchingNextPage,
    refetch: payHeadsRefetch,
  } = useGetDeliveryPayHeads(firmCode, payMode, {
    enabled: payMode === "CASH" && !!firmCode,
    searchText: debouncedPayHeadSearch,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const payHeadsDataFlat =
    payHeadsData?.pages?.flatMap((page, pageIndex) =>
      (Array.isArray(page) ? page : [])
        .map((item, itemIndex) => {
          // Clean the head value by removing leading dots, commas, and whitespace
          const cleanedHead = item?.head?.replace(/^[.,\s]+/, "").trim() || "";
          return {
            ...item,
            head: cleanedHead,
            uniqueKey: `paymode-${pageIndex}-${itemIndex}-${item?.code || ""}-${cleanedHead}`,
          };
        })
        .filter((item) => {
          // Filter out entries that are empty after cleaning
          return item.head.length > 0;
        })
    ) || [];

  ///----PAGINATION LOGIC FOR CASH LEDGERS FOR MODAL FLATLIST -----//
  const onHeadRefresh = useCallback(async () => {
    setPayHeadRefreshing(true);
    try {
      await payHeadsRefetch();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setPayHeadRefreshing(false);
    }
  }, [payHeadsRefetch]);

  const handlePayHeadsLoadMore = useCallback(() => {
    if (payHeadsHasNextPage && !payHeadsIsFetchingNextPage && !payHeadsLoading) {
      payHeadsFetchNextPage();
    }
  }, [payHeadsHasNextPage, payHeadsIsFetchingNextPage, payHeadsFetchNextPage, payHeadsLoading]);

  const handlePayHeadsModalClose = useCallback(() => {
    setPayHeadModalVisible(false);
    setPayHeadSearch(""); // Clear search on close
  }, []);

  const handlePayHeadsOpenModal = useCallback(() => {
    setPayHeadSearch(""); // Clear search when opening
    setPayHeadModalVisible(true);
  }, []);

  const handlePayHeadsRetry = useCallback(() => {
    payHeadsRefetch();
  }, [payHeadsRefetch]);

  ///------PAYMENT HEADES PAGINATION END-------///

  // function setHandleLedgerData(data) {
  //   setCashLedger(data);
  //   console.log("Selected Pay Head:", data);
  // }

  ///----------------------PAYMENT HEADES API CALLS END----------------------------

  ///------Other functions and handlers-------///

  // Handle change in payment mode selection
  const handlePayModeChange = useCallback((value) => {
    console.log("Selected Pay Mode:", value);
    const selectedPayMode = toPayModeOptions.find((option) => option.value === value);
    setPayMode(value);
    setPayModeCode(selectedPayMode?.code || ""); // Set the code
    if (value !== "CASH") setCashLedger("");
  }, []);

  // Handle selection of cash ledger from modal
  const setHandleLedgerData = useCallback((item) => {
    console.log("Selected Pay Head:", item);
    setCashLedger(item?.head || item?.label || "");
    setCashLedgerCode(item?.code || ""); // Store the code for submission
    setPayHeadModalVisible(false);
    setPayHeadSearch(""); // Clear search on select
  }, []);

  //total amount auto-calculation based on the individual charge fields
  const totalAmount = useMemo(() => {
    const nums = [gcCharge, deliveryCharge, hamaly, otherCharges, doorDelivery, freightCharge].map((v) => parseFloat(v) || 0);
    return nums.reduce((a, b) => a + b, 0).toFixed(2);
  }, [gcCharge, deliveryCharge, hamaly, otherCharges, doorDelivery, freightCharge]);

  ///------Other functions and handlers-------///

  ////------------------FORM VALIDATION For sumbit api call-------------------//
  const validateForm = () => {
    // Required fields validation
    if (!docketNo || docketNo === "") {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Validation Error",
        message: "Please select a docket number",
      });
      return false;
    }

    if (!customer || customer.trim() === "") {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Validation Error",
        message: "Customer name is required",
      });
      return false;
    }

    // if (!deliveredTo || deliveredTo.trim() === "") {
    //   setToastConfig({
    //     visible: true,
    //     type: "error",
    //     title: "Validation Error",
    //     message: "Please enter who received the delivery",
    //   });
    //   return false;
    // }

    if (!contactNo || contactNo.trim() === "") {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Validation Error",
        message: "Contact number is required",
      });
      return false;
    }

    if (!idNumber || idNumber.trim() === "") {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Validation Error",
        message: "ID number is required",
      });
      return false;
    }

    // Payment mode specific validations
    if (payMode === "CASH" && !allowedCredit && (!cashLedger || cashLedger.trim() === "")) {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Validation Error",
        message: "Please select a cash ledger",
      });
      return false;
    }

    if (payMode === "CHEQUE" && (!chequeNo || chequeNo.trim() === "")) {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Validation Error",
        message: "Cheque number is required for cheque payments",
      });
      return false;
    }

    return true;
  };

  ////------------------FORM VALIDATION END-------------------//

  //////------------------HANDLER FOR SAVE BUTTON CLICK-------------------//
  const handleSave = (print = false) => {
    if (!validateForm()) return;
    if (print) setPrintBtnLoading(true);
    const todayISO = new Date().toISOString();
    const payload = {
      rcptType: receiptType,
      isNew: true,
      rcptId: 0,
      rcptSeries: series,
      rcptStatus: rcptStatus,
      rcptNo: Number(rptNo),
      rcptDate: date,
      rcptTime: time.toISOString(), // Convert Date to ISO string
      finCode,
      firmCode,
      docketId: Number(docketId),
      docketNo: Number(docketNo),
      customerCode: customerCode.toString(),
      customerId: Number(customerId),
      customerName: customer,
      freightCharge: gcCharge,
      hamali: hamaly,
      stnryCharge: totalAmount,
      otherCharge: otherCharges,
      totalAmount: totalAmount,
      payMode: payMode,
      payModeCode: allowedCredit == true ? aCCCodeFOREcredit : cashLedgerCode,
      payModeHead: allowedCredit == true ? aCCCodeFOREcredit : cashLedger,
      chequeNo: chequeNo,
      chequeDate: chequeNo !== "" ? todayISO : null,
      chequeBank: "",
      narration: narration,
      deliveredTo: null,
      idProof: identityType,
      deliveredPhone: contactNo,
      remarks: remarks,
      idProofNo: idNumber,
      branchCode: branchCode,
      finCode: finCode,
      coFinCode: coFinCode,
      userId: userId,
      impFrom: "",
      impId: 0,
      OtherChargeDesc: "Loading Charge",
    };
    console.log("Payload for Submission:", payload);

    submitDeliveryRecipt(payload, {
      onSuccess: (data) => {
        console.log("Submission Response: from the API screen page", data);
        setToastConfig({
          visible: true,
          type: "success",
          title: "Payment Successful",
          message: data?.message || "The payment has been submitted successfully.",
        });
        if (print && data?.dataValue) {
          // ✅ Set receipt ID to trigger PDF query
          setSavedReceiptId(data.dataValue);
          setShouldPrint(true);
        } else {
          setPrintBtnLoading(false);
          // ✅ Just navigate if no print
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "DeliveryReciptEntryScreen" }],
            });
          }, 1500);
        }
      },
      onError: (error) => {
        setToastConfig({
          visible: true,
          type: "error",
          title: "Submission Failed",
          message: error?.message || "Failed to submit the payment. Please try again.",
        });
      },
    });
  };

  //////------------------HANDLER FOR SAVE BUTTON CLICK END-------------------//

  ////---------------PRINT API CALL USING RECEIPT ID-------------------//
  // PDF query - only triggers when savedReceiptId is set and shouldPrint is true
  const {
    data: pdfBase64,
    isLoading: isPdfLoading,
    isError: isPdfError,
    error: pdfError,
    isPending: isPendingPrint,
  } = useGetDeliveryReceiptPdf(savedReceiptId, firmCode, finCode, {
    enabled: !!savedReceiptId && !!firmCode && !!finCode && shouldPrint,
  });

  // Trigger print when PDF data is ready
  useEffect(() => {
    if (pdfBase64 && shouldPrint && savedReceiptId) {
      handlePrintPdf(pdfBase64);
    }
  }, [pdfBase64, shouldPrint, savedReceiptId]);

  // Handle PDF errors
  useEffect(() => {
    if (isPdfError && shouldPrint) {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Print Failed",
        message: pdfError?.message || "Failed to load PDF for printing.",
      });
      setShouldPrint(false);
      setPrintBtnLoading(false);
      setSavedReceiptId(null);
      // Navigate even if print fails
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "DeliveryReciptEntryScreen" }],
        });
      }, 1500);
    }
  }, [isPdfError, shouldPrint]);

  const handlePrintPdf = async (base64) => {
    try {
      await Print.printAsync({
        uri: `data:application/pdf;base64,${base64}`,
      });
      if (Platform.OS === "android") {
        // Android: print screen closed — navigate away
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "DeliveryReciptEntryScreen" }],
          });
        }, 1500);
      } else {
        // iOS: DO NOT navigate here — it forcefully tears down the native
        // print sheet. Let the user tap back manually instead.
        setToastConfig({
          visible: true,
          type: "success",
          title: "Print Sent",
          message: "Document sent to printer. Tap back to continue.",
        });
      }
    } catch (error) {
      const message = error?.message || "";
      // iOS throws "Printing did not complete" when the user cancels/dismisses
      // the print dialog — this is not a real error, treat as cancel.
      const isCancelled =
        message.toLowerCase().includes("did not complete") ||
        message.toLowerCase().includes("cancelled") ||
        message.toLowerCase().includes("canceled") ||
        error?.code === "E_PRINT_FAILED";

      if (isCancelled) {
        if (Platform.OS === "android") {
          // Android: user closed/cancelled print screen — navigate away
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "DeliveryReciptEntryScreen" }],
            });
          }, 1500);
        } else {
          // iOS: stay on screen so user can retry
          setToastConfig({
            visible: true,
            type: "warning",
            title: "Print Cancelled",
            message: "Print was cancelled. You can retry or tap back to continue.",
          });
        }
      } else {
        console.error("Print error:", error);
        setToastConfig({
          visible: true,
          type: "error",
          title: "Print Error",
          message: "Failed to open print dialog.",
        });
      }
    } finally {
      setShouldPrint(false);
      setSavedReceiptId(null);
      setPrintBtnLoading(false);
    }
  };

  ////---------------PRINT API CALL USING RECEIPT ID END-------------------//

  if (isPdfLoading && shouldPrint) {
    return <Loader title="Preparing PDF for printing..." />;
  }

  /* ---------------------------------------------------------------- */
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScanToast
        visible={toastConfig.visible}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        onHide={() => setToastConfig({ ...toastConfig, visible: false })}
      />
      {/* Inline overlay shown while fetching docket details — avoids full remount */}
      {deliveryReceiptDetailsLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingOverlayText, { color: colors.primary }]}>Loading docket details...</Text>
        </View>
      )}
      {/* Modal for docket selection */}
      <DocketModal
        visible={modalVisible}
        onClose={handleModalClose}
        docketData={docketDataFlat}
        onSelect={handleDocketSelect}
        isLoading={docketisLoading}
        isFetchingNextPage={docketIsFetchingNextPage}
        hasNextPage={docketHasNextPage}
        onLoadMore={handleLoadMore}
        onRefresh={onRefresh}
        refreshing={refreshing}
        error={docketError}
        onRetry={handleRetry}
        searchValue={docketSearch}
        onSearchChange={setDocketSearch}
      />

      <PayHeadModal
        visible={payHeadModalVisible}
        onClose={handlePayHeadsModalClose}
        payHeadsData={payHeadsDataFlat}
        onSelect={setHandleLedgerData}
        isLoading={payHeadsLoading}
        isFetchingNextPage={payHeadsIsFetchingNextPage}
        hasNextPage={payHeadsHasNextPage}
        onLoadMore={handlePayHeadsLoadMore}
        onRefresh={onHeadRefresh}
        refreshing={payHeadRefreshing}
        error={payHeadsError}
        onRetry={handlePayHeadsRetry}
        searchValue={payHeadSearch}
        onSearchChange={setPayHeadSearch}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 20 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === "ios" ? 100 : 80}
        extraHeight={Platform.OS === "ios" ? 100 : 80}
        enableAutomaticScroll={true}
        showsVerticalScrollIndicator={false}
        keyboardOpeningTime={0}
        enableResetScrollToCoords={false}
      >
        {/* ======================== BASIC INFORMATION ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="information-circle-outline" title="Basic Information" colors={colors} />

          <View>
            <Text className="text-2xl mb-2" style={{ color: colors.primary, fontWeight: "500" }}>
              Receipt No : {branchCode}
              {autoReceiptNumber}
            </Text>
          </View>
          <FullWidthSelectInput
            label="Receipt Type"
            value={receiptType}
            onChange={setReceiptType}
            items={RECEIPT_TYPE_OPTIONS}
            labelFontSize={12}
            labelFontWeight="400"
            labelLineHeight={14}
            style={styles.flex1}
          />

          {/* Display the docket NUMBER, not ID */}
          <Input label="Select Docket" value={docketNo} onPress={handleOpenModal} placeholder="Select a docket number" editable={false} />

          <Input label="Customer Name" value={customer} onChangeText={setCustomer} placeholder="Customer name" readOnly={true} />
          <Input
            label="Customer Address"
            multiline
            inputStyle={styles.textareaForCustomer}
            value={customerAddress}
            onChangeText={setCustomerAddress}
            placeholder="Customer address"
            readOnly={true}
          />
          <Input
            label="Customer Mobile Number"
            value={customerMobileNumber}
            onChangeText={setCustomerMobileNumber}
            placeholder="Customer mobile number"
            readOnly={true}
          />

          <View style={[styles.twoCol, styles.mt16]}>
            <CalendarInput
              label="Date"
              value={date}
              onChange={setDate}
              disableFuture={true}
              containerStyle={styles.flex1}
              minDate={getSevenDaysAgo()}
            />
            <TimeInput
              label="Pickup Time"
              value={time}
              onChange={(value) => {
                if (value instanceof Date) {
                  setTime(value); // Keep as Date object
                }
              }}
              containerStyle={styles.flex1}
            />
          </View>

          <View style={styles.mt16}>
            <Text style={styles.chipLabel}>Status</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { borderColor: colors.primary, backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.chipText, { color: colors.primary, fontWeight: "600" }]}>{rcptStatus}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ======================== CHARGES ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="card-outline" title="Charges" colors={colors} />

          <View style={styles.twoCol}>
            <Input
              label="GC Total Amount"
              value={gcCharge}
              onChangeText={setGcCharge}
              keyboardType="decimal-pad"
              containerStyle={[styles.flex1, styles.mt0]}
            />
            <Input
              label="Delivery Charge"
              value={deliveryCharge}
              onChangeText={setDeliveryCharge}
              keyboardType="decimal-pad"
              containerStyle={[styles.flex1, styles.mt0]}
            />
          </View>

          <View style={[styles.twoCol, styles.mt16]}>
            <Input label="Hamaly" value={hamaly} onChangeText={setHamaly} keyboardType="decimal-pad" containerStyle={[styles.flex1, styles.mt0]} />
            <Input
              label="CR Charges"
              value={otherCharges}
              onChangeText={setOtherCharges}
              keyboardType="decimal-pad"
              containerStyle={[styles.flex1, styles.mt0]}
            />
          </View>

          <View style={[styles.twoCol, styles.mt16, styles.balanceRow]}>
            <View style={styles.totalBox}>
              <Text style={[styles.totalLabel, { color: colors.bodyText }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>

        {/* ======================== PAYMENT DETAILS ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="wallet-outline" title="Payment Details" colors={colors} />

          <View>
            <View style={styles.flex1}>
              {allowedCredit ? (
                <>
                  <Input label="Pay Mode" value="CREDIT" placeholder="Credit" readOnly={true} containerStyle={styles.mt0} />
                  <Text style={{ marginTop: 6, fontSize: 12, color: colors.primary, fontWeight: "500" }}>
                    Credit Limit: ₹{allowedCreditLimit.toFixed(2)}
                  </Text>
                </>
              ) : (
                <>
                  <FullWidthSelectInput
                    label="Pay Mode"
                    value={payMode}
                    onChange={handlePayModeChange}
                    items={toPayModeOptions}
                    labelFontSize={12}
                    labelFontWeight="500"
                    labelLineHeight={14}
                  />

                  {paymentModesLoading && <Text style={{ marginTop: 6, fontSize: 12, color: colors.bodyText }}>Loading payment modes...</Text>}

                  {!!paymentModesError && (
                    <Text style={{ marginTop: 6, fontSize: 12, color: "#EF4444" }}>Failed to load payment modes. Showing default options.</Text>
                  )}
                </>
              )}
            </View>

            {!allowedCredit && payMode === "CASH" && (
              <>
                <Input
                  label="Cash Ledger"
                  placeholder="Select cash ledger"
                  value={cashLedger}
                  onPress={handlePayHeadsOpenModal}
                  containerStyle={[styles.flex1, styles.mt10]}
                />

                {payHeadsLoading && <Text style={{ marginTop: 6, fontSize: 12, color: colors.bodyText }}>Loading pay heads...</Text>}

                {!!payHeadsError && <Text style={{ marginTop: 6, fontSize: 12, color: "#EF4444" }}>Failed to load pay heads.</Text>}
              </>
            )}
          </View>

          {!allowedCredit && payMode === "CHEQUE" && (
            <Input label="Cheque No / Date" value={chequeNo} onChangeText={setChequeNo} placeholder="Optional" />
          )}

          <Input
            label="Narration"
            value={narration}
            onChangeText={setNarration}
            placeholder="Add payment notes..."
            multiline
            numberOfLines={4}
            inputStyle={styles.textarea}
          />
        </View>

        {/* ======================== DELIVERY DETAILS ======================== */}
        <View style={[styles.card, styles.DeliveryCard]}>
          <SectionHeader iconName="location-outline" title="Delivery Details" colors={colors} />

          <Input
            label="Delivered To"
            value={deliveredTo}
            onChangeText={setDeliveredTo}
            placeholder="Receiver's name"
            containerStyle={{ marginTop: 3 }}
          />

          <FullWidthSelectInput
            label="Identity Type"
            value={identityType}
            onChange={setIdentityType}
            items={IDENTITY_TYPE_OPTIONS}
            labelFontSize={12}
            labelFontWeight="400"
            labelLineHeight={18}
            style={{ marginTop: 12 }}
          />

          <Input label="ID Number" value={idNumber} onChangeText={setIdNumber} placeholder="Enter ID number" />

          <Input label="Contact No" value={contactNo} onChangeText={setContactNo} placeholder="+91 00000 00000" keyboardType="phone-pad" />

          <Input
            label="Remarks"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Any special instructions"
            multiline
            numberOfLines={3}
            inputStyle={styles.textarea}
          />
        </View>
      </KeyboardAwareScrollView>

      {/* ======================== BOTTOM ACTION BAR ======================== */}
      <BottomActionBar includeBottomInset={false}>
        <View className="flex-row gap-3">
          <Button
            variant="secondary"
            size="lg"
            onPress={() => handleSave(false)}
            className="flex-1"
            disabled={isSubmitting}
            loading={isSubmitting && !shouldPrint}
          >
            Save
          </Button>

          <Button
            variant="primary"
            size="lg"
            onPress={() => handleSave(true)}
            className="flex-1"
            disabled={printBtnLoading}
            loading={printBtnLoading}
          >
            <View style={styles.printRow}>
              <Printer size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.printText}>Save &amp; Print</Text>
            </View>
          </Button>
        </View>
      </BottomActionBar>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                               */
/* ------------------------------------------------------------------ */
const makeStyles = (colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.appBg,
    },
    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.headerBg,
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    backBtn: {
      width: 36,
      alignItems: "flex-start",
    },
    backArrow: {
      fontSize: 22,
      color: colors.headerText,
    },
    headerTitle: {
      fontSize: 18,

      fontWeight: "600",
      color: colors.headerText,
    },
    /* Scroll */
    scroll: {
      padding: 16,
      gap: 16,
    },

    /* Card */
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 3,
    },
    DeliveryCard: {
      marginBottom: 12,
    },
    /* Layout helpers */
    twoCol: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    flex1: { flex: 1, marginTop: 3 },
    mt0: { marginTop: 0 },
    mt5: { marginTop: 5 },
    mt10: { marginTop: 10 },
    mt16: { marginTop: 12 },
    balanceRow: {
      alignItems: "center",
    },
    totalBox: {
      flex: 1,
      alignItems: "flex-end",
      justifyContent: "center",
      paddingRight: 4,
    },

    /* Status chips */
    colLabel: {
      fontSize: 12,
      color: colors.inputText,

      fontWeight: "500",
      marginBottom: 6,
    },
    chipLabel: {
      fontSize: 12,
      color: colors.bodyText,

      fontWeight: "500",
      marginBottom: 8,
    },
    chipRow: {
      flexDirection: "row",
      gap: 10,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    chipText: {
      fontSize: 12,
    },

    /* Total amount */
    totalLabel: {
      fontSize: 12,

      marginBottom: 4,
      textAlign: "right",
      letterSpacing: 0.3,
    },
    totalValue: {
      fontSize: 24,

      fontWeight: "700",
      textAlign: "right",
    },

    /* Textarea */
    textarea: {
      height: 90,
      minHeight: 90,
      paddingTop: 14,
      textAlignVertical: "top",
    },
    textareaForCustomer: {
      height: 90,
      minHeight: 50,
      paddingTop: 14,
      textAlignVertical: "top",
    },

    /* Bottom */
    bottomContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    printRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    printText: {
      color: "#fff",
      fontSize: 14,

      fontWeight: "600",
    },

    /* Docket loading overlay */
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.35)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      gap: 12,
    },
    loadingOverlayText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#fff",
    },
  });
