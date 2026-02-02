import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useFinalSubmitData, useGetBarcodeSubmitSummaryHeader, useGetDocketScanList } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";

export default function DocketScanSummaryScreen({ route }) {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { thcid } = route.params;
  const { sessionData } = useAuthStore();
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "completed", "shortage"
  const isFocused = useIsFocused();

  const {
    data: summaryHeaderData,
    isLoading,
    isError,
    error,
  } = useGetBarcodeSubmitSummaryHeader(thcid, sessionData?.branchCode, {
    enabled: isFocused && !!thcid && !!sessionData?.branchCode,
  });

  const {
    data: docketScanData,
    isLoading: isDocketLoading,
    isError: isDocketError,
    error: docketError,
  } = useGetDocketScanList(sessionData?.branchCode, thcid, {
    enabled: isFocused && !!thcid && !!sessionData?.branchCode,
  });

  const submitDocketScanSummary = useFinalSubmitData();

  const dockets =
    docketScanData?.map((item, idx) => ({
      id: item?.docketid,
      number: item?.docketno,
      totalPackets: item?.totalPackets,
      scanned: item?.scanned,
      short: item?.totalPackets - item?.scanned,
      status: item?.scanned === item?.totalPackets ? "completed" : "shortage",
      uniqueKey: `${item?.docketid}_${item?.docketno}_${idx}`,
    })) || [];

  const totalPacketsSum = dockets.reduce((sum, docket) => sum + (docket?.totalPackets || 0), 0);

  // Filter dockets based on selected status
  const filteredDockets = dockets.filter((docket) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "completed") return docket?.status === "completed";
    if (filterStatus === "shortage") return docket?.status === "shortage";
    return true;
  });

  const DocketCard = ({ docket }) => {
    const isShortage = docket?.status === "shortage";
    const borderColor = isShortage ? "#f97316" : theme.colors.success;

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
              {docket?.number}
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

        <View
          className="flex-row p-2 rounded-lg"
          style={{
            backgroundColor: theme.colors.background,
          }}
        >
          <View className="flex-1 items-center border-r" style={{ borderRightColor: "#e2e8f0" + "40" }}>
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.secondaryText }}>
              Packets
            </Text>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
              {docket?.totalPackets}
            </Text>
          </View>
          <View className="flex-1 items-center border-r" style={{ borderRightColor: "#e2e8f0" + "40" }}>
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.secondaryText }}>
              Scanned
            </Text>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
              {docket?.scanned}
            </Text>
          </View>
          <TouchableOpacity
            className="flex-1 items-center"
            disabled={docket?.short === 0}
            onPress={() => {
              if (docket?.short > 0) {
                navigation.navigate("DocketPedningScreen", { thcid: thcid, docketId: docket?.id });
              }
            }}
            activeOpacity={docket?.short > 0 ? 0.7 : 1}
          >
            <Text className="text-[10px] uppercase" style={{ color: theme.colors.secondaryText }}>
              Short
            </Text>
            <Text
              className="text-sm font-bold"
              style={{
                color: docket?.short > 0 ? "#f97316" : theme.colors.secondaryText,
                textDecorationLine: docket?.short > 0 ? "underline" : "none",
              }}
            >
              {docket?.short}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  function handleFinchish(thcid) {
    const userId = sessionData?.userId || "";
    const branchCode = sessionData?.branchCode || "";
    const finCode = sessionData?.finCode || "";
    const tusTime = new Date().toISOString().split("T")[0];

    const params = {
      thcid: thcid,
      userId: userId,
      branchCode: branchCode,
      finCode: finCode,
      tusTime: tusTime,
    };

    submitDocketScanSummary.mutate(params, {
      onSuccess: (data) => {
        Toast.show({
          type: "success",
          text1: "Submission Successful",
          text2: data?.status?.message || "Packets submitted successfully",
          position: "top",
          visibilityTime: 3000,
        });
        navigation.navigate("TruckArivalAfterReportScreen");
      },
      onError: (error) => {
        Toast.show({
          type: "error",
          text1: "Submission Failed",
          text2: error.message || "Failed to submit missing packets",
          position: "top",
          visibilityTime: 3000,
        });
      },
    });
    // Implement the finish logic here, such as making an API call to complete the process.
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-4 pt-4 gap-6">
          {/* Summary Card */}
          <View
            className="rounded-2xl p-5 shadow-sm border relative overflow-hidden"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderColor: "#e2e8f0" + "40",
            }}
          >
            <View className="mb-5 flex-row items-center justify-between pb-4 border-b" style={{ borderBottomColor: "#e2e8f0" + "30" }}>
              <View className="flex-row items-center gap-2">
                <Ionicons name="car" size={20} color={theme.colors.primary} />
                <Text className="text-sm font-semibold uppercase tracking-wide" style={{ color: theme.colors.secondaryText }}>
                  Truck No
                </Text>
              </View>
              <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>
                {summaryHeaderData?.vehicleNo}
              </Text>
            </View>

            <View className="flex-row flex-wrap">
              <View className="w-1/2 mb-5">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Total Dockets
                </Text>
                <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>
                  {summaryHeaderData?.totalDockets} / {dockets?.length}
                </Text>
              </View>
              <View className="w-1/2 mb-5">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Total Weight
                </Text>
                <Text className="text-lg font-bold" style={{ color: theme.colors.text }}>
                  {summaryHeaderData?.totalWeight}{" "}
                  <Text className="text-xs font-normal" style={{ color: theme.colors.secondaryText }}>
                    kg
                  </Text>
                </Text>
              </View>
              <View className="w-1/2 mb-5">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Gdn Wt
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                  {summaryHeaderData?.godnWt}
                </Text>
              </View>
              <View className="w-1/2 mb-5">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  DDST Wt
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                  {summaryHeaderData?.dstWt}
                </Text>
              </View>
              <View className="w-1/2 mb-5">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Packets
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
                  {summaryHeaderData?.totalPackets} / {totalPacketsSum}
                </Text>
              </View>
              <View className="w-1/2 mb-5">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Scanned
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text className="text-base font-semibold" style={{ color: theme.colors.success }}>
                    {summaryHeaderData?.scanned}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                </View>
              </View>
              <View className="w-1/2">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Short
                </Text>
                <Text className="text-base font-semibold" style={{ color: "#ef4444" }}>
                  {(summaryHeaderData?.totalPackets || 0) - (summaryHeaderData?.scanned || 0)}
                </Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.secondaryText }}>
                  Excess
                </Text>
                <Text className="text-base font-semibold" style={{ color: "#f97316" }}>
                  {summaryHeaderData?.excessCount}
                </Text>
              </View>
            </View>
          </View>

          {/* Docket Details Header */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between px-1">
              <Text className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.colors.secondaryText }}>
                Docket Details
              </Text>
              <View className="px-2 py-1 rounded-full" style={{ backgroundColor: "#e2e8f0" + "40" }}>
                <Text className="text-xs" style={{ color: theme.colors.secondaryText }}>
                  {filteredDockets?.length} items
                </Text>
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
          </View>

          {/* Docket Cards */}
          <View className="gap-3">
            {filteredDockets?.map((docket) => (
              <DocketCard key={docket?.uniqueKey} docket={docket} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View
        className="absolute bottom-0 w-full px-4 py-4 border-t"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderTopColor: "#e2e8f0" + "40",
          paddingBottom: insets.bottom,
        }}
      >
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Button
              variant="secondary"
              size="lg"
              onPress={() => {
                handleFinchish(thcid);
              }}
            >
              Finish
            </Button>
          </View>
          <View className="flex-1">
            <Button variant="primary" size="lg" onPress={() => navigation.navigate("DocketAddExtra", { thcid: thcid })}>
              Add Extra
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
