import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetOutwardsScanningDocketListForALS, useGetOutwardsSummaryHeaderData, useOutwadesSummarySubmit } from "../../../hooks/useApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import BottomButtonContainer from "../../components/ButtomTwoButtonContainer";
import { Button } from "../../components/Button";
import { ScanToast } from "../../components/ScanToast";

export default function NewSummaryScreen({ route }) {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
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

  const { data, isLoading, refetch, isError, error } = useGetOutwardsSummaryHeaderData(altId, {
    enabled: isFocused && !!altId,
  });

  const { data: docketData, error: docketError } = useGetOutwardsScanningDocketListForALS(branchCode, altId, {
    enabled: isFocused && !!altId,
  });

  const summaryDataSubmit = useOutwadesSummarySubmit();

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
        </View>
      </View>
    );
  };

  const [filterStatus, setFilterStatus] = useState("all");

  function handleSumbitSumaryData() {
    const params = {
      branchCode: branchCode,
      alT_ID: altId,
    };

    summaryDataSubmit.mutate(params, {
      onSuccess: (response) => {
        setToastConfig({
          visible: true,
          type: "success",
          title: "Submitted successfully",
          message: `${response?.status?.message}` || "Summary data submitted successfully.",
        });
        // Optionally, navigate to another screen or show a success message
        setTimeout(() => {
          navigation.navigate("OutwardsList");
        }, 2000);
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

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
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
                {/* <View className="flex-1">
                  <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                    Total Dockets
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                    {summaryHeaderData.totalDockets}
                  </Text>
                </View> */}
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

          {/* Header Shortage and Navigation */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <TouchableOpacity onPress={() => navigation.navigate("OutwadesDocketsRemoval", { altId: altId })}>
              <Text style={{ color: theme.colors.primary }}>Remove Docket from ALS</Text>
            </TouchableOpacity>
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
      <View
        className="absolute bottom-0 w-full px-4 border-t"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderTopColor: "#e2e8f0" + "40",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <BottomButtonContainer>
          <Button variant="secondary" size="lg" onPress={() => handleSumbitSumaryData()}>
            Finish
          </Button>
        </BottomButtonContainer>
      </View>
    </View>
  );
}
