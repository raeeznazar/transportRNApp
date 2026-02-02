import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Tooltip from "react-native-walkthrough-tooltip";
import { useGetInward, useSubmitInwardsReport } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import { showErrorToast, showSuccessToast } from "../../utilityfunctions/toastHelper";
import { Button } from "../components/Button";

export default function InwadesScreen() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const [fromDate, setFromDate] = useState(thirtyDaysAgo);
  const [toDate, setToDate] = useState(today);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [showTipIndex, setShowTipIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [location, setLocation] = useState(null);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  // New states for remarks modal
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentReportItem, setCurrentReportItem] = useState(null);
  const [pendingReportedThcId, setPendingReportedThcId] = useState(null); // NEW
  const isFocused = useIsFocused();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const branchName = sessionData?.branchName;
  const modifiedFromDate = formatDate(fromDate);
  const modifiedToDate = formatDate(toDate);

  const { data, isLoading, isError, error, refetch, isFetching } = useGetInward(branchCode, modifiedFromDate, modifiedToDate, {
    enabled: isFocused && !!branchCode && !!modifiedFromDate && !!modifiedToDate,
  });

  // Add the mutation hook
  const submitReportMutation = useSubmitInwardsReport();

  const isInitialLoading = isLoading || (isFetching && !data);

  // compute filteredData as a hook so hook order stays stable
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;
    const normalizedQuery = searchQuery.replace(/\s+/g, "").toLowerCase();
    return data.filter((item) => {
      const normalizedTruckNo = item.truckNo?.replace(/\s+/g, "").toLowerCase() || "";
      return normalizedTruckNo.includes(normalizedQuery);
    });
  }, [data, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (branchCode) {
        refetch();
      }
    }, [branchCode, modifiedFromDate, modifiedToDate, refetch])
  );

  // Keep hooks call order stable: show branch-loading or query-loading after hooks are defined
  if (isInitialLoading || !branchCode) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Loading branch data…</Text>
      </View>
    );
  }
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: insets.bottom }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Loading data…</Text>
      </View>
    );
  }

  const onChangeFrom = (event, selectedDate) => {
    setShowFrom(false);
    if (selectedDate) setFromDate(selectedDate);
  };
  const onChangeTo = (event, selectedDate) => {
    setShowTo(false);
    if (selectedDate) setToDate(selectedDate);
  };
  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }
  const handleViewDetails = (thcId) => {
    navigation.navigate("InwardesDetails", {
      inwardId: "25",
      thcId: thcId,
      toStation: branchCode,
      reportedType: "beforeReport",
    });
  };
  const handleYes = () => {
    setShowDialog(false);
    // Perform your parent logic here
  };

  // Handle cancel in remarks modal
  const handleCancelRemarks = () => {
    setShowRemarksModal(false);
    setRemarks("");
    setLocation(null);
    setCurrentReportItem(null);
    setLoadingItemId(null);
    setIsCapturingLocation(false);
  };

  // Handle submit report
  const handleSubmitReport = async () => {
    if (!currentReportItem || !location) return;
    const reportedThcId = currentReportItem.thcId; // capture before clearing
    const payload = {
      tR_THCID: currentReportItem.thcId,
      tR_Tuck: currentReportItem.truckNo,
      tR_ReportFrom: "branch",
      tR_ReportUserType: "user",
      tR_Remarks: remarks.trim(),
      tR_BranchCode: branchCode,
      tR_ReportedByID: sessionData?.userId,
      entryDate: new Date().toISOString(),
      tR_Date: new Date().toISOString(),
      geoLocation: null,
      latitude: location?.latitude,
      longitude: location?.longitude,
    };

    setIsSubmitting(true);
    try {
      await submitReportMutation.mutateAsync(payload);
      setPendingReportedThcId(reportedThcId);
      const successMessage = "Report submitted successfully!";
      showSuccessToast(successMessage, "Success");
      await refetch(); // ensure fresh data replaces old list
      // reset modal state
      setShowRemarksModal(false);
      setRemarks("");
      setLocation(null);
      setCurrentReportItem(null);
    } catch (error) {
      showErrorToast(error?.message || "Failed to submit report. Please try again.", "Error");
    } finally {
      setIsSubmitting(false);
      setLoadingItemId(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  async function handleReport(item) {
    setLoadingItemId(item.thcId);
    setCurrentReportItem(item);
    setIsCapturingLocation(true);
    setShowRemarksModal(true);

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setShowRemarksModal(false);
        setLoadingItemId(null);
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to submit a report.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });
      setIsCapturingLocation(false);
    } catch (error) {
      setIsCapturingLocation(false);
      setShowRemarksModal(false);
      setLoadingItemId(null);

      let errorMessage = "Failed to get your location. Please try again.";
      if (error.code === "E_LOCATION_SERVICES_DISABLED") {
        errorMessage = "Location services are disabled. Please enable them in your device settings.";
      } else if (error.code === "E_LOCATION_TIMEOUT") {
        errorMessage = "Location request timed out. Please try again.";
      }

      Alert.alert("Location Error", errorMessage, [{ text: "OK" }]);
    }
  }
  function handleTruckArrival(thcId, thcNo) {
    navigation.navigate("TruckArrivalSheetScreen", {
      thcId: thcId,
      thcNo: thcNo,
    });
  }
  const renderCard = ({ item, index }) => {
    const reportDisabled = !!loadingItemId || item.isReportedByBranch || isSubmitting || pendingReportedThcId === item.thcId;

    const arrivalDisabled = !!loadingItemId || (!item.isReportedByBranch && !item.isReportedByDriver && pendingReportedThcId !== item.thcId);

    return (
      <View className="mx-3 mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
        <LinearGradient
          colors={[theme.colors.buttonPrimaryBg, theme.colors.buttonPrimaryText]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 56 }}
        >
          <View className="flex-row items-center justify-between px-4 h-full">
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-extrabold">🚚 {item.truckNo || "N/A"}</Text>
            </View>
            <View className="flex-row items-center px-3 py-2 rounded-lg ">
              <Text className="text-inputText font-semibold text-base ml-2">
                Manifest : <Text className="text-[#e30613]">{item?.manifestCount ?? "0"}</Text>
              </Text>
            </View>
            <Tooltip
              isVisible={showTipIndex === index}
              content={<Text>Total Packages: {item?.totalPackets ?? "0"}</Text>}
              placement="top"
              onClose={() => setShowTipIndex(null)}
            >
              <TouchableOpacity onPress={() => setShowTipIndex(index)}>
                <Text className="font-semibold">📦 {item?.totalPackets ?? "0"}</Text>
              </TouchableOpacity>
            </Tooltip>
          </View>
        </LinearGradient>
        <View className="p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-inputBackground px-3 py-1.5 rounded-full">
              <Text className="ml-1.5 font-semibold text-inputText">From : </Text>
              <Text className="ml-1.5 font-semibold text-inputText">{item?.fromBranch ?? "N/A"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            <View className="flex-row items-center bg-inputBackground px-3 py-1.5 rounded-full">
              <Text className="ml-1.5 font-semibold text-inputText">Next : </Text>
              <Text className="ml-1.5 font-semibold text-inputText">{item?.nextBranch ?? "N/A"}</Text>
            </View>
          </View>
          <View className="border-t border-dashed border-gray-200 my-3" />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <View className="flex-row items-center justify-start">
                <Ionicons name="calendar-outline" size={12} color={theme.colors.inputText} />
                <Text className="ml-1.5 font-semibold text-inputText text-sm">THC Date </Text>
                <Text className="text-textPrimary text-sm">{item?.thcDate ? new Date(item.thcDate).toLocaleDateString() : "N/A"}</Text>
              </View>
              <View className="flex-row items-center justify-start mt-1">
                <Ionicons name="time-outline" size={12} color={theme.colors.inputText} />
                <Text className="ml-1.5 font-semibold text-inputText text-sm">Exp Arrival </Text>
                <Text className="text-sm text-textPrimary">
                  {item?.expectedArrival
                    ? `${new Date(item.expectedArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, ${new Date(item.expectedArrival).toLocaleDateString()}`
                    : "N/A"}
                </Text>
              </View>
              <View className="flex-row items-center justify-start mt-1">
                <Text className="font-semibold text-sm ms-5">Godown Weight: </Text>
                <Text className="text-textPrimary text-sm">{item?.godownWeight ?? "N/A"}</Text>
              </View>
            </View>
            <View className="w-[1px] bg-inputBackground mx-3" />
            <View className="flex-1">
              <View className="flex-row items-center justify-start">
                <Text className="font-semibold text-sm">THC No : </Text>
                <Text className="text-textPrimary text-sm">{item?.thcNo ?? "N/A"}</Text>
              </View>
              <View className="flex-row items-center justify-start mt-1">
                <Text className="font-semibold text-sm">DDST Amount: </Text>
                <Text className="text-textPrimary text-sm">{item?.ddstAmount ?? "N/A"}</Text>
              </View>
              <View className="flex-row items-center justify-start mt-1">
                <Text className="font-semibold text-sm">Total Weight: </Text>
                <Text className="text-textPrimary text-sm">{item?.totalWeight ?? "N/A"}</Text>
              </View>
            </View>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="person-circle-outline" size={18} color={theme.colors.inputText} />
              <Text className="ml-1.5 text-inputText">
                <Text className="font-semibold">{item?.driverName ?? "N/A"}</Text>
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="call-outline" size={18} color={theme.colors.inputText} />
              <Text className="ml-1.5 text-inputText">
                <Text className="font-semibold">{item.driverPhone || "N/A"}</Text>
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row gap-3">
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                handleReport(item);
              }}
              disabled={reportDisabled}
              className="flex-1"
            >
              {loadingItemId === item.thcId ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="ml-2 text-white font-semibold">Getting location...</Text>
                </View>
              ) : isSubmitting && pendingReportedThcId === item.thcId ? (
                <View className="flex-row items-center justify-center">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="ml-2 text-white font-semibold">Submitting...</Text>
                </View>
              ) : (
                "Report"
              )}
            </Button>

            <Button
              variant="primary"
              size="md"
              onPress={() => {
                handleTruckArrival(item?.thcId, item?.thcNo);
              }}
              disabled={arrivalDisabled}
              className="flex-1"
            >
              Arrival
            </Button>
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                handleViewDetails(item.thcId);
              }}
              disabled={!!loadingItemId}
              className="flex-1"
            >
              Manifest
            </Button>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 0,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: theme.colors.appBg,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Search Input */}
      <View className="mx-4 mt-4 mb-2">
        <View
          className="flex-row items-center  rounded-xl px-4 py-3 border shadow-sm"
          style={{ backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder }}
        >
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            className="flex-1 ml-3 text-base text-inputText"
            placeholder="Search by truck number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} className="ml-2 active:opacity-60">
              <Ionicons name="close-circle" size={22} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text className="mt-2 text-sm text-bodyText ml-1">
            Found {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>
      <View className="mx-4 mt-2 mb-2 flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => setShowFrom(true)}
          className="flex-1 flex-row items-center justify-start bg-white border border-gray-200 rounded-lg px-3 py-2.5"
        >
          <Text className="text-textSecondary text-sm">From : </Text>
          <Text className="text-textPrimary font-medium">{fromDate.toLocaleDateString("en-GB")}</Text>
        </TouchableOpacity>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.inputText} />
        <TouchableOpacity
          onPress={() => setShowTo(true)}
          className="flex-1 flex-row items-center justify-start bg-white border border-gray-200 rounded-lg px-3 py-2.5"
        >
          <Text className="text-textSecondary text-sm">To : </Text>
          <Text className="text-textPrimary font-medium">{toDate.toLocaleDateString("en-GB")}</Text>
        </TouchableOpacity>
      </View>
      {showFrom && <DateTimePicker value={fromDate} mode="date" display="calendar" onChange={onChangeFrom} maximumDate={toDate} />}
      {showTo && (
        <DateTimePicker value={toDate} mode="date" display="calendar" onChange={onChangeTo} minimumDate={fromDate} maximumDate={new Date()} />
      )}
      <View className="flex-1 mt-3">
        <FlatList
          data={filteredData}
          keyExtractor={(item, idx) => `${item?.truckNo ?? ""}${idx}`}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.buttonPrimaryBg]} // Android
              tintColor={theme.colors.buttonPrimaryBg} // iOS
              title="Pull to refresh" // iOS
              titleColor={theme.colors.textSecondary} // iOS
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-inputText text-base">{searchQuery ? "No trucks found matching your search" : "No data found"}</Text>
            </View>
          }
        />
      </View>

      {/* Remarks Modal */}
      <Modal transparent visible={showRemarksModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-textPrimary">Submit Report</Text>
              {isCapturingLocation && (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color={theme.colors.alertColor} />
                  <Text className="ml-2 text-sm text-textSecondary">Capturing location...</Text>
                </View>
              )}
            </View>

            {/* Truck Info */}
            {currentReportItem && (
              <View className="bg-gray-50 rounded-lg p-3 mb-4">
                <Text className="text-sm text-textSecondary">Truck Number</Text>
                <Text className="text-base font-semibold text-textPrimary mt-1">{currentReportItem.truckNo}</Text>
              </View>
            )}

            {/* Remarks Input */}
            <View className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-semibold text-textPrimary">Remarks (Optional)</Text>
                <Text className="text-xs text-textSecondary">{remarks.length}/50</Text>
              </View>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base text-textPrimary"
                placeholder="Enter any remarks..."
                value={remarks}
                onChangeText={(text) => {
                  if (text.length <= 50) {
                    setRemarks(text);
                  }
                }}
                maxLength={50}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!isCapturingLocation && !isSubmitting}
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancelRemarks}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 rounded-lg py-3 items-center active:opacity-70"
                style={{ opacity: isSubmitting ? 0.5 : 1 }}
              >
                <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={isCapturingLocation || !location || isSubmitting}
                className="flex-1 rounded-lg py-3 items-center active:opacity-70"
                style={{
                  backgroundColor: isCapturingLocation || !location || isSubmitting ? "#D1D5DB" : theme.colors.buttonPrimaryBg,
                  opacity: isCapturingLocation || !location || isSubmitting ? 0.6 : 1,
                }}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="ml-2 text-white font-semibold text-base">Submitting...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-base">Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  dateRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  label: { marginRight: 10, fontSize: 16, fontWeight: "500" },
});
