import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetAlsDirectSummaryModalCheck,
  useGetAlsDocketSummaryDetails,
  useGetOutwardsScanningDocketListForALS,
  useGetOutwardsSummaryHeaderData,
  useOutwadesDirectAlsFinalSubmit,
} from "../../../hooks/useApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import BottomActionBar from "../../components/BottomActionBar";
import { Button } from "../../components/Button";
import CommonModal from "../../components/CommonModal";
import { ScanToast } from "../../components/ScanToast";
export default function OutwadesDirectALSSummaryScreen({ route }) {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const [showModal, setShowModal] = useState(false);
  const [DDTSModalVisible, setDDTSModalVisible] = useState(false);
  const [doorDeliveryDockets, setDoorDeliveryDockets] = useState([]);
  const [selectedDocket, setSelectedDocket] = useState(null);
  const [selectedDoorDeliveryDockets, setSelectedDoorDeliveryDockets] = useState([]);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!isFocused) {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [isFocused]);

  const { altId } = route.params || {}; // Get altId from route params

  //********************* API CALLS ************************ */
  const { data, isLoading, refetch, isError, error } = useGetOutwardsSummaryHeaderData(altId, {
    enabled: isFocused && !!altId,
  });

  const { data: docketData, error: docketError } = useGetOutwardsScanningDocketListForALS(branchCode, altId, {
    enabled: isFocused && !!altId,
  });

  // Trigger this query only when needed
  const {
    data: summaryModalCheckData,
    error: summaryModalCheckError,
    refetch: refetchModalCheck,
    isLoading: isModalCheckLoading,
  } = useGetAlsDirectSummaryModalCheck(altId, branchCode, {
    enabled: false, // Don't auto-fetch
  });

  const {
    data: docketDetailData,
    error: docketDetailError,
    isLoading: isDocketDetailLoading,
  } = useGetAlsDocketSummaryDetails(selectedDocket?.id, {
    enabled: isFocused && !!selectedDocket?.id,
  });
  const finalSubmit = useOutwadesDirectAlsFinalSubmit();

  //********************* API CALLS END ************************ */

  //********************* DOCKECT HEADER CARD ************************ */
  // Dummy data for summary header and dockets
  const summaryHeaderData = {
    vehicleNo: data?.truckNo || "",
    driverName: data?.driver || "",
    totalDockets: data?.totalDockets || 0,
    totalPackets: data?.totalPackets || 0,
    totalWeight: data?.totalWeight || 0,
    scanned: data?.scanned || 0,
    short: data?.totalPackets - data?.scanned || 0,
    excessCount: data?.excessCount || 0,
    damagedCount: data?.damagedCount || 0,
    routeFrom: data?.routeFrom || "",
    routeTo: data?.routeTo || "",
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Server error loading data…</Text>
      </View>
    );
  }

  //********************* DOCKECT HEADER CARD END ************************ */

  //********************* DOCKECT LIST CARD ************************ */

  // Transform API docketData to match the expected dockets array structure
  const dockets = Array.isArray(docketData)
    ? docketData.map((d) => ({
        id: d.docketID,
        number: d.docketNo?.toString() || "",
        totalPackets: d.totalPackets,
        scanned: d.scanned,
        status: d.status?.toLowerCase() === "complete" || d.isComplete ? "completed" : d.short > 0 ? "shortage" : "pending",
      }))
    : [];

  //Docket List Card Component
  const DocketCard = ({ docket }) => {
    const isShortage = docket.status === "shortage";
    const borderColor = isShortage ? "#f97316" : theme.colors.success;
    const shortCount = docket.totalPackets - docket.scanned;
    const isShortLink = shortCount > 0;

    return (
      <View
        className="rounded-xl p-4 shadow-sm border border-l-[6px]"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderColor: "#e2e8f0" + "40",
          borderLeftColor: borderColor,
        }}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-xs mb-0.5" style={{ color: theme.colors.secondaryText }}>
              Docket No
            </Text>
            <Text className="text-base font-bold" style={{ color: theme.colors.text }}>
              {docket.number}
            </Text>
          </View>
          <View
            className="px-2 py-1 rounded"
            style={{
              backgroundColor: isShortage ? "#fed7aa" : theme.colors.success + "20",
            }}
          >
            <Text
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{
                color: isShortage ? "#c2410c" : theme.colors.success,
              }}
            >
              {isShortage ? "Shortage" : "Completed"}
            </Text>
          </View>
        </View>

        <View className="flex-row p-2 rounded-lg" style={{ backgroundColor: theme.colors.background }}>
          <View className="flex-1 items-center border-r" style={{ borderRightColor: "#e2e8f0" + "40" }}>
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.secondaryText }}>
              Packets
            </Text>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
              {docket.totalPackets}
            </Text>
          </View>
          <View className="flex-1 items-center border-r" style={{ borderRightColor: "#e2e8f0" + "40" }}>
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.secondaryText }}>
              Scanned
            </Text>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
              {docket.scanned}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-1 items-center border-r"
            style={{ borderRightColor: "#e2e8f0" + "40" }}
            disabled={!isShortLink}
            onPress={() => {
              if (!isShortLink) return;
              navigation.navigate("OutwardsSummaryPendingPackets", { docketId: docket.id });
            }}
          >
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.secondaryText }}>
              Short
            </Text>
            <Text
              className={`text-sm font-semibold ${isShortLink ? "underline" : ""}`}
              style={{ color: isShortLink ? theme.colors.text : theme.colors.secondaryText }}
            >
              {shortCount}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center border-r"
            style={{ borderRightColor: "#e2e8f0" + "40" }}
            onPress={() => handleSummaryModal(docket)}
          >
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.text }}>
              Details
            </Text>
            <Text className={`text-sm font-semibold`} style={{ color: theme.colors.text }}>
              <Ionicons name="information-circle-outline" size={22} color="#1D4ED8" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const [filterStatus, setFilterStatus] = useState("all");

  //********************* DOCKECT LIST CARD END ************************ */

  //********************* HANDLE FINAL SUBMISSION ************************ */

  async function handleSumbitSumaryData() {
    console.log("Checking for door delivery dockets with altId:", altId, "and branchCode:", branchCode);

    try {
      const response = await refetchModalCheck();
      // Supports both shapes:
      // 1) refetch result wrapper: { data: { dataValue: [...] } }
      // 2) direct payload: { dataValue: [...] }
      const payload = response?.data ?? response;
      const ddList = Array.isArray(payload?.dataValue) ? payload.dataValue : Array.isArray(payload) ? payload : [];

      if (ddList.length > 0) {
        console.log("Door delivery dockets found:", ddList);
        setDoorDeliveryDockets(ddList);
        setDDTSModalVisible(true);
        return;
      }
      // No door delivery dockets - proceed with submission
      const params = {
        branchCode,
        alT_ID: altId,
        ddTruckList: [{ docketID: 0, doorDelivery: false }],
      };

      finalSubmitCall(params);
    } catch (error) {
      console.error("Error checking modal:", error);
      setToastConfig({
        visible: true,
        type: "error",
        title: "Error",
        message: "Failed to check door delivery status",
      });
    }
  }

  // Submit the Data after selecting dockets for DDST
  function submitSummaryData() {
    const params = {
      branchCode: branchCode,
      alT_ID: altId,
      ddTruckList: selectedDoorDeliveryDockets,
    };

    console.log("Submitting summary data with params:", params);
    setDDTSModalVisible(false);

    finalSubmitCall(params);
  }

  //This function will make the final submit API call for summary submission with or without door delivery dockets based on user selection in modal
  function finalSubmitCall(params) {
    finalSubmit.mutate(params, {
      onSuccess: (response) => {
        setToastConfig({
          visible: true,
          type: "success",
          title: "Submitted successfully",
          message: `${response?.status?.message}` || "Summary data submitted successfully.",
        });
        // Optionally, navigate to another screen or show a success message
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "OutwardsList" }],
          });
        }, 3000);
      },
      onError: (error) => {
        setToastConfig({
          visible: true,
          type: "error",
          title: "Submission Failed",
          message: `${error || "An error occurred while submitting the summary data."}`,
        });
        // Optionally, show an error message to the user
      },
    });
  }

  ///------------------- FINAL SUMBISSION MODAL CHECK-------------------- */
  const handleDoorDeliveryToggle = useCallback((docketId) => {
    setSelectedDoorDeliveryDockets((prev) => {
      const exists = prev.find((item) => item.docketID === docketId);

      let newState;
      if (exists) {
        // Remove from array if unchecked
        newState = prev.filter((item) => item.docketID !== docketId);
      } else {
        // Add to array if checked
        newState = [...prev, { docketID: docketId, doorDelivery: true }];
      }

      // Log the new state that will be set
      console.log("Updated selectedDoorDeliveryDockets:", newState);
      return newState;
    });
  }, []);

  // Add this function to check if a docket is selected
  const isDocketSelected = useCallback(
    (docketID) => {
      return selectedDoorDeliveryDockets.some((item) => item.docketID === docketID);
    },
    [selectedDoorDeliveryDockets]
  );
  ///------------------- FINAL SUMBISSION MODAL CHECK-------------------- */

  //********************* HANDLE FINAL SUBMISSION END ************************ */

  //********************* DOCKET SUMMARY DETAILS MODAL ************************ */
  //This function will handle the Summary Modal when user clicks on details button in docket card
  function handleSummaryModal(docket) {
    setSelectedDocket(docket);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedDocket(null);
  }
  const totalItems = docketDetailData?.reduce((sum, item) => sum + (item.totalNos || 0), 0) || 0;
  //********************* DOCKET SUMMARY DETAILS MODAL END ************************ */

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <CommonModal
        visible={showModal}
        title="Docket Details"
        onClose={closeModal}
        showClose
        closeText="Close"
        isLoading={isDocketDetailLoading}
        loadingText="Loading docket details..."
      >
        {selectedDocket && docketDetailData && (
          <View className="gap-4">
            {/* Header Info */}
            <View className="gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs" style={{ color: theme.colors.secondaryText }}>
                  Docket ID
                </Text>
                <Text className="text-sm font-semibold" style={{ color: theme.colors.primary }}>
                  {docketDetailData[0]?.docketID || selectedDocket?.number}
                </Text>
              </View>
              <View className="flex-row justify-between items-center pb-3 border-b" style={{ borderBottomColor: theme.colors.cardBorder }}>
                <Text className="text-xs" style={{ color: theme.colors.secondaryText }}>
                  Total Items
                </Text>
                <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                  {totalItems}
                </Text>
              </View>
            </View>

            {/* Inventory Items Section */}
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: theme.colors.secondaryText }}>
                INVENTORY ITEMS
              </Text>

              <ScrollView style={{ maxHeight: 350 }} showsVerticalScrollIndicator={true}>
                <View className="gap-3">
                  {docketDetailData.map((item, index) => (
                    <View
                      key={index}
                      className="flex-row gap-3 p-3 rounded-xl"
                      style={{
                        backgroundColor: theme.colors.background,
                      }}
                    >
                      {/* Icon */}
                      <View className="w-12 h-12 rounded-xl items-center justify-center" style={{ backgroundColor: theme.colors.primary + "20" }}>
                        <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <Text className="text-base font-bold mb-1" style={{ color: theme.colors.text }}>
                          Item {index + 1}
                        </Text>
                        <View className="flex-row gap-4">
                          <Text className="text-sm" style={{ color: theme.colors.secondaryText }}>
                            Content: <Text style={{ color: theme.colors.text }}>{item.content}</Text>
                          </Text>
                        </View>
                        <Text className="text-sm mt-1" style={{ color: theme.colors.secondaryText }}>
                          Package: <Text style={{ color: theme.colors.text }}>{item.packetype}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
        {docketDetailError && (
          <View className="p-4 items-center">
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.alertColor} />
            <Text className="mt-2 text-center" style={{ color: theme.colors.alertColor }}>
              Failed to load docket details
            </Text>
          </View>
        )}
      </CommonModal>

      {/* Door Delivery Modal */}
      <CommonModal
        visible={DDTSModalVisible}
        title="Door Delivery Dockets"
        onClose={() => {
          setDDTSModalVisible(false);
          setSelectedDoorDeliveryDockets([]);
        }}
        onSubmit={submitSummaryData}
        showClose
        showSubmit
        closeText="Cancel"
        submitText="Confirm"
      >
        <View>
          <Text style={{ color: theme.colors.secondaryText, marginBottom: 12 }}>Select dockets for door delivery:</Text>

          {/* Table Header */}
          <View
            style={{
              flexDirection: "row",
              padding: 12,
              backgroundColor: theme.colors.primary + "15",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.cardBorder,
            }}
          >
            <Text style={{ flex: 1, fontSize: 12, fontWeight: "600", color: theme.colors.text }}>Docket Number</Text>
            <Text
              style={{
                width: 80,
                fontSize: 12,
                fontWeight: "600",
                color: theme.colors.text,
                textAlign: "center",
              }}
            >
              DDST
            </Text>
          </View>

          {/* Scrollable List */}
          <ScrollView style={{ maxHeight: 300 }}>
            {doorDeliveryDockets.map((docket, index) => (
              <TouchableOpacity
                key={docket.docketID}
                onPress={() => handleDoorDeliveryToggle(docket.docketID)}
                activeOpacity={0.7}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 12,
                  backgroundColor: index % 2 === 0 ? theme.colors.background : theme.colors.cardBg,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.cardBorder + "30",
                }}
              >
                <Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: theme.colors.text }}>{docket.docketNo}</Text>

                <View style={{ width: 80, alignItems: "center" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: isDocketSelected(docket.docketID) ? theme.colors.primary : theme.colors.secondaryText + "60",
                      backgroundColor: isDocketSelected(docket.docketID) ? theme.colors.primary : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isDocketSelected(docket.docketID) && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </CommonModal>

      <ScanToast
        visible={toastConfig.visible}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        onHide={() => setToastConfig({ ...toastConfig, visible: false })}
      />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <View className="px-4 pt-4 gap-6">
          {/* Summary Card */}
          <View
            className="rounded-2xl p-5 shadow-sm border relative overflow-hidden"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderColor: "#e2e8f0" + "40",
            }}
          >
            <View className="mb-2 flex-row items-center justify-between pb-2 border-b" style={{ borderBottomColor: "#e2e8f0" + "30" }}>
              <View className="flex-row items-center gap-2">
                <Ionicons name="car" size={20} color={theme.colors.primary} />
                <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.colors.secondaryText }}>
                  Truck No
                </Text>
              </View>
              <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>
                {summaryHeaderData.vehicleNo}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center gap-4 mb-5 pb-4 border-b" style={{ borderBottomColor: "#e2e8f0" + "30" }}>
              <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                Driver Name
              </Text>
              <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                {summaryHeaderData.driverName}
              </Text>
            </View>
            <View className="flex-row flex-wrap">
              <View className="w-full flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Total Packets
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                    {summaryHeaderData.totalPackets}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Total Damage
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                    {summaryHeaderData.damagedCount}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Route
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                    {summaryHeaderData.routeFrom} - {summaryHeaderData.routeTo}
                  </Text>
                </View>
              </View>
              <View className="w-full flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Scanned
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: theme.colors.success }}>
                    {summaryHeaderData.scanned}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Short
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: "#f97316" }}>
                    {summaryHeaderData.short}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Excess
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: "#fb923c" }}>
                    {summaryHeaderData.excessCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 py-2 px-3 rounded-lg items-center"
              style={{
                backgroundColor: filterStatus === "all" ? theme.colors.primary : theme.colors.cardBg,
                borderWidth: 1,
                borderColor: filterStatus === "all" ? theme.colors.primary : "#e2e8f0" + "40",
              }}
              onPress={() => setFilterStatus("all")}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: filterStatus === "all" ? "#fff" : theme.colors.secondaryText,
                }}
              >
                All ({dockets?.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-2 px-3 rounded-lg items-center"
              style={{
                backgroundColor: filterStatus === "completed" ? theme.colors.success : theme.colors.cardBg,
                borderWidth: 1,
                borderColor: filterStatus === "completed" ? theme.colors.success : "#e2e8f0" + "40",
              }}
              onPress={() => setFilterStatus("completed")}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: filterStatus === "completed" ? "#fff" : theme.colors.secondaryText,
                }}
              >
                Complete ({dockets?.filter((d) => d?.status === "completed").length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-2 px-3 rounded-lg items-center"
              style={{
                backgroundColor: filterStatus === "shortage" ? "#f97316" : theme.colors.cardBg,
                borderWidth: 1,
                borderColor: filterStatus === "shortage" ? "#f97316" : "#e2e8f0" + "40",
              }}
              onPress={() => setFilterStatus("shortage")}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: filterStatus === "shortage" ? "#fff" : theme.colors.secondaryText,
                }}
              >
                Short ({dockets?.filter((d) => d?.status === "shortage").length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Docket Cards */}
          <View className="gap-3">
            {docketError ? (
              <View
                className="rounded-xl p-4 shadow-sm border border-l-[6px]"
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: "#e2e8f0" + "40",
                  borderLeftColor: theme.colors.alertColor,
                }}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-bold" style={{ color: theme.colors.alertColor }}>
                    Server error loading dockets…
                  </Text>
                </View>
                <Text className="text-xs" style={{ color: theme.colors.secondaryText }}>
                  Please try again.
                </Text>
              </View>
            ) : (
              dockets
                .filter((docket) => filterStatus === "all" || docket.status === filterStatus)
                .map((docket) => <DocketCard key={docket.id} docket={docket} />)
            )}
          </View>
        </View>
      </ScrollView>
      {/* Footer Buttons */}

      {/* <ButtonContainer>
          <Button variant="primary" size="lg" onPress={() => handleSumbitSumaryData()} fullWidth>
            Finish
          </Button>
        </ButtonContainer> */}

      <BottomActionBar includeBottomInset={false}>
        <View className="flex-row gap-3">
          <Button variant="primary" size="lg" onPress={() => handleSumbitSumaryData()} fullWidth>
            Finish
          </Button>
        </View>
      </BottomActionBar>
    </View>
  );
}
