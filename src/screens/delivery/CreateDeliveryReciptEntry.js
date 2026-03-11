import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Printer } from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  useGetDeliveryPayHeads,
  useGetDeliveryPayMode,
  useGetDeliveryReciptDetailsByDocketId,
  useGetDocketNumberLookup,
} from "../../../hooks/useDeliveryApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import BottomActionBar from "../../components/BottomActionBar";
import { Button } from "../../components/Button";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import Input from "../../components/Input";
import Loader from "../../components/Loader";
import ScrollSearchFlatlist from "../../components/ScrollSearchFlatlist";

/* ------------------------------------------------------------------ */
/*  Static option lists                                               */
/* ------------------------------------------------------------------ */
const DELIVERY_TYPE_OPTIONS = [
  { label: "Home Delivery", value: "home" },
  { label: "Branch Pickup", value: "branch" },
  { label: "Door Delivery", value: "door" },
];

const DOCKET_OPTIONS = [
  { label: "Customer A", value: "cust_a" },
  { label: "Customer B", value: "cust_b" },
  { label: "Customer C", value: "cust_c" },
];

const STATUS_OPTIONS = ["Pending", "Delivered", "Cancelled"];

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

const TO_ACCOUNT_OPTIONS = [
  { label: "Main Branch A", value: "main_a" },
  { label: "Main Branch B", value: "main_b" },
];

const BANK_ACCOUNT_OPTIONS = [
  { label: "HDFC Bank - 501002...", value: "hdfc_501" },
  { label: "SBI Bank - 301001...", value: "sbi_301" },
];

const IDENTITY_TYPE_OPTIONS = [
  { label: "Aadhaar Card", value: "aadhaar" },
  { label: "PAN Card", value: "pan" },
  { label: "Passport", value: "passport" },
  { label: "Driving Licence", value: "driving" },
];

const heads = [
  {
    head: "(abul Hassan,)bismi Bag  & Shoes",
    address: "Ernakulam",
    place: "Ernakulam",
    code: "209041",
  },
  {
    head: "Al Noor Footwear & Bags",
    address: "MG Road, Ernakulam",
    place: "Ernakulam",
    code: "209042",
  },
  {
    head: "City Walk Shoes",
    address: "Kaloor Junction",
    place: "Kochi",
    code: "209043",
  },
  {
    head: "Green Mart Traders",
    address: "Broadway Market",
    place: "Kochi",
    code: "209044",
  },
  {
    head: "Royal Bag House",
    address: "Marine Drive",
    place: "Ernakulam",
    code: "209045",
  },
  {
    head: "Fashion Footwear",
    address: "Palarivattom",
    place: "Kochi",
    code: "209046",
  },
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

  const [freightCharge, setFreightCharge] = useState("1250.00");
  const [deliveryCharge, setDeliveryCharge] = useState("150.00");
  const [hamaly, setHamaly] = useState("50.00");
  const [otherCharges, setOtherCharges] = useState("25.00");

  const [payMode, setPayMode] = useState("CASH");
  const [receiptType, setReceiptType] = useState("cash");
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
  const [deliveryReceiptDetailsLoading, setDeliveryReceiptDetailsLoading] = useState(false);
  const [cashLedger, setCashLedger] = useState("");
  const pageSize = 20;
  const isFocused = useIsFocused();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const finCode = sessionData?.finCode;
  const firmCode = "0001";
  const rcptType = "DOOR";
  const entryDate = date;
  const [payHeadModalVisible, setPayHeadModalVisible] = useState(false);

  // Search states for server-side filtering
  const [docketSearch, setDocketSearch] = useState("");
  const [payHeadSearch, setPayHeadSearch] = useState("");

  // Debounced search values
  const debouncedDocketSearch = useDebounce(docketSearch, 500);
  const debouncedPayHeadSearch = useDebounce(payHeadSearch, 500);

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
    keepPreviousData: true,
  });

  const docketDataFlat = useMemo(() => {
    if (!docketData?.pages) return [];

    return docketData.pages.flatMap((page, pageIndex) =>
      page.items.map((item, itemIndex) => ({
        ...item,
        // Fix: Use consistent property names
        uniqueKey: `${pageIndex}-${itemIndex}-${item.docketID}-${item.docketNo}`,
      }))
    );
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
    if (docketHasNextPage && !docketIsFetchingNextPage) {
      docketFetchNextPage();
    }
  }, [docketHasNextPage, docketIsFetchingNextPage, docketFetchNextPage]);

  const handleModalClose = useCallback(() => {
    setModalVisible(false);
    setDocketSearch(""); // Clear search on close
  }, []);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleRetry = useCallback(() => {
    docketRefetch();
  }, [docketRefetch]);

  ///------DOCKET LOOKUP PAGINATION END-------///

  ///--------------------API CALLS FOR DOCKET NUMBER LOOKUP END------------------------///

  ///----------------------API CALLS FOR DOCKET FOR BINDING DATA-------------------------///
  const handleDocketSelect = useCallback((item) => {
    console.log("Selected Docket:", item);
    // Set the docket ID for API calls
    setDocketId(String(item.docketID || ""));
    // Set the docket number for display
    setDocketNo(String(item.docketNo || ""));
    setModalVisible(false);
    setDocketSearch(""); // Clear search on select
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
  // Update loading state for the auto-populate form
  useEffect(() => {
    setDeliveryReceiptDetailsLoading(deliveryReceiptDetailsLoadingData);
  }, [deliveryReceiptDetailsLoadingData]);
  // Auto-populate form when delivery receipt details are loaded
  console.log("Delivery Receipt Details by Docket ID:", deliveryReceiptDetails);
  useEffect(() => {
    if (deliveryReceiptDetails) {
      // Update form fields with the API response data
      setCustomer(deliveryReceiptDetails.custName || "");
      setCustomerMobileNumber(deliveryReceiptDetails.mobile || deliveryReceiptDetails.phone || "");
      setAllowedCredit(deliveryReceiptDetails.allowedCredit || false);
      setCreditLimit(deliveryReceiptDetails.creditLimit || 0);
      setCustomerId(deliveryReceiptDetails.custId || "");
      setCustomerBranch(deliveryReceiptDetails.branchCode || "");
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

  console.log("Payment Heads Data:", payHeadsData);

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

  console.log("Flattened Pay Heads Data:", payHeadsDataFlat);

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
    if (payHeadsHasNextPage && !payHeadsIsFetchingNextPage) {
      payHeadsFetchNextPage();
    }
  }, [payHeadsHasNextPage, payHeadsIsFetchingNextPage, payHeadsFetchNextPage]);

  const handlePayHeadsModalClose = useCallback(() => {
    setPayHeadModalVisible(false);
    setPayHeadSearch(""); // Clear search on close
  }, []);

  const handlePayHeadsOpenModal = useCallback(() => {
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

  const handlePayModeChange = useCallback((value) => {
    setPayMode(value);
    if (value !== "CASH") setCashLedger("");
  }, []);

  const setHandleLedgerData = useCallback((item) => {
    console.log("Selected Pay Head:", item);
    setCashLedger(item?.head || item?.label || "");
    setPayHeadModalVisible(false);
    setPayHeadSearch(""); // Clear search on select
  }, []);

  const totalAmount = useMemo(() => {
    const nums = [freightCharge, deliveryCharge, hamaly, otherCharges, doorDelivery].map((v) => parseFloat(v) || 0);
    return nums.reduce((a, b) => a + b, 0).toFixed(2);
  }, [freightCharge, deliveryCharge, hamaly, otherCharges, doorDelivery]);

  const handleSave = () => {
    // TODO: submit form
  };

  const handleSaveAndPrint = () => {
    // TODO: submit + print
  };

  // Handle loading state after all hooks are declared
  if (deliveryReceiptDetailsLoading) {
    return <Loader title="Loading delivery receipt details..." />;
  }

  /* ---------------------------------------------------------------- */
  return (
    <View style={styles.screen}>
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

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 20 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ======================== BASIC INFORMATION ======================== */}
        <View style={styles.card}>
          <SectionHeader iconName="information-circle-outline" title="Basic Information" colors={colors} />

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
            label="Customer Mobile Number"
            value={customerMobileNumber}
            onChangeText={setCustomerMobileNumber}
            placeholder="Customer mobile number"
            readOnly={true}
          />

          <View style={styles.mt16}>
            <Text style={styles.chipLabel}>Status</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, { borderColor: colors.primary, backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.chipText, { color: colors.primary, fontWeight: "600" }]}>{"Pending"}</Text>
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
              value={freightCharge}
              onChangeText={setFreightCharge}
              readOnly={true}
              containerStyle={[styles.flex1, styles.mt0]}
            />
            <Input
              label="Delivery Charge"
              value={deliveryCharge}
              onChangeText={setDeliveryCharge}
              readOnly={true}
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
            </View>

            {payMode === "CASH" && (
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

            {(payMode === "CHEQUE" || payMode === "UPI" || payMode === "BANK") && (
              <FullWidthSelectInput
                label="To Account"
                value={toAccount}
                onChange={setToAccount}
                items={TO_ACCOUNT_OPTIONS}
                labelFontSize={12}
                labelFontWeight="500"
                labelLineHeight={14}
                style={styles.flex1}
              />
            )}
          </View>

          {payMode === "CHEQUE" && <Input label="Cheque No / Date" value={chequeNo} onChangeText={setChequeNo} placeholder="Optional" />}

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
        <View style={styles.card}>
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
      </ScrollView>

      {/* ======================== BOTTOM ACTION BAR ======================== */}
      <BottomActionBar includeBottomInset={false}>
        <View className="flex-row gap-3">
          <Button variant="secondary" size="lg" onPress={handleSave} className="flex-1">
            Save
          </Button>

          <Button variant="primary" size="lg" onPress={handleSaveAndPrint} className="flex-1">
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
      height: undefined,
      minHeight: 90,
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
  });
