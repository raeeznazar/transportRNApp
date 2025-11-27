import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Tooltip from "react-native-walkthrough-tooltip";

import { useGetInward } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";
import QRScanner from "../components/QRScanner";

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
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const branchName = sessionData?.branchName;
  const modifiedFromDate = formatDate(fromDate);
  const modifiedToDate = formatDate(toDate);
  const { data, isLoading, isError, error, refetch } = useGetInward(branchCode, modifiedFromDate, modifiedToDate);

  // console.log("branchCode, modifiedFromDate, modifiedToDate:", branchCode, modifiedFromDate, modifiedToDate);

  console.log("Inwards Data:", data);

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
      // toStation: "KTKRA",
    });
  };
  const handleYes = () => {
    setShowDialog(false);
    console.log("✅ Yes pressed — function called!");
    // Perform your parent logic here
  };
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    // Remove spaces from search query for comparison
    const normalizedQuery = searchQuery.replace(/\s+/g, "").toLowerCase();

    return data.filter((item) => {
      // Remove spaces from truck number for comparison
      const normalizedTruckNo = item.truckNo?.replace(/\s+/g, "").toLowerCase() || "";
      return normalizedTruckNo.includes(normalizedQuery);
    });
  }, [data, searchQuery]);

  const handleScanComplete = (data) => {
    console.log("QR Code Scanned:", data);
    // Process the scanned data here
    setShowScanner(false);
  };

  function InwardScanning() {
    navigation.navigate("InwardScanning");
  }

  async function handleReport(item) {
    setIsGettingLocation(true);

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location services to submit a report. This helps verify your location.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setIsGettingLocation(false),
            },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
                setIsGettingLocation(false);
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

      console.log("📍 Location captured:", { latitude, longitude });
      setLocation({ latitude, longitude });

      // Show success message
      Alert.alert("Location Captured ✅", `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`, [
        {
          text: "OK",
          onPress: () => {
            // Navigate to report screen or send data
            // navigation.navigate('ReportScreen', {
            //   latitude,
            //   longitude,
            //   truckData: item,
            // });

            // Or send to API
            console.log("Sending report with location:", {
              latitude,
              longitude,
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error getting location:", error);

      let errorMessage = "Failed to get your location. Please try again.";

      if (error.code === "E_LOCATION_SERVICES_DISABLED") {
        errorMessage = "Location services are disabled. Please enable them in your device settings.";
      } else if (error.code === "E_LOCATION_TIMEOUT") {
        errorMessage = "Location request timed out. Please try again.";
      }

      Alert.alert("Location Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsGettingLocation(false);
    }
  }

  function handleTruckArrival() {
    navigation.navigate("TruckArrivalSheetScreen", {
      inwardId: "25",
      toStation: branchCode,
      // toStation: "KTKRA",
    });
  }

  const renderCard = ({ item, index }) => (
    <View className="mx-3 mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
      <LinearGradient
        colors={[theme.colors.buttonPrimaryBg, theme.colors.buttonPrimaryText]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 56 }}
      >
        <View className="flex-row items-center justify-between px-4 h-full">
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-extrabold">🚚 {item.truckNo}</Text>
          </View>
          <View className="flex-row items-center px-3 py-2 rounded-lg ">
            <Text className="text-inputText font-semibold text-base ml-2">
              Manifest : <Text className="text-[#e30613]">{item.manifestCount}</Text>
            </Text>
          </View>

          <Tooltip
            isVisible={showTipIndex === index}
            content={<Text>Total Packages: {item.totalPackets}</Text>}
            placement="top"
            onClose={() => setShowTipIndex(null)}
          >
            <TouchableOpacity onPress={() => setShowTipIndex(index)}>
              <Text className="font-semibold">📦 {item.totalPackets}</Text>
            </TouchableOpacity>
          </Tooltip>
        </View>
      </LinearGradient>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-inputBackground px-3 py-1.5 rounded-full">
            <Text className="ml-1.5 font-semibold text-inputText">From : </Text>
            <Text className="ml-1.5 font-semibold text-inputText">{item.fromBranch || "N/A"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          <View className="flex-row items-center bg-inputBackground px-3 py-1.5 rounded-full">
            <Text className="ml-1.5 font-semibold text-inputText">Next : </Text>
            <Text className="ml-1.5 font-semibold text-inputText">{item.nextBranch || "N/A"}</Text>
          </View>
        </View>

        <View className="border-t border-dashed border-gray-200 my-3" />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <View className="flex-row items-center justify-start">
              <Ionicons name="calendar-outline" size={12} color={theme.colors.inputText} />
              <Text className="ml-1.5 font-semibold text-inputText text-sm">THC Date </Text>
              <Text className="text-textPrimary text-sm">{new Date(item.thcDate).toLocaleDateString()}</Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Ionicons name="time-outline" size={12} color={theme.colors.inputText} />
              <Text className="ml-1.5 font-semibold text-inputText text-sm">Exp Arrival </Text>
              <Text className="text-sm text-textPrimary">
                {item.expectedArrival
                  ? `${new Date(item.expectedArrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, ${new Date(item.expectedArrival).toLocaleDateString()}`
                  : "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Text className="font-semibold text-sm ms-5">Godown Weight: </Text>
              <Text className="text-textPrimary text-sm">{item.godownWeight || "N/A"}</Text>
            </View>
          </View>

          <View className="w-[1px] bg-inputBackground mx-3" />

          <View className="flex-1">
            <View className="flex-row items-center justify-start">
              <Text className="font-semibold text-sm">THC No : </Text>
              <Text className="text-textPrimary text-sm">{item.thcNo || "N/A"}</Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Text className="font-semibold text-sm">DDST Amount: </Text>
              <Text className="text-textPrimary text-sm">{item.ddstAmount || "N/A"}</Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Text className="font-semibold text-sm">Total Weight: </Text>
              <Text className="text-textPrimary text-sm">{item.totalWeight || "N/A"}</Text>
            </View>
          </View>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="person-circle-outline" size={18} color="theme.colors.inputText" />
            <Text className="ml-1.5 text-inputText">
              <Text className="font-semibold">{item.driverName}</Text>
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="call-outline" size={18} color="theme.colors.inputText" />
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
              handleReport();
            }}
            className="flex-1"
          >
            Report
          </Button>
          <Button
            variant="primary"
            size="md"
            onPress={() => {
              handleTruckArrival();
            }}
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
            className="flex-1"
          >
            Manifest
          </Button>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
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
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={theme.colors.alertColor} />
            <Text className="mt-2 text-inputText">Loading inwards...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item, idx) => item.truckNo + idx}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-10">
                <Text className="text-inputText text-base">{searchQuery ? "No trucks found matching your search" : "No data found"}</Text>
              </View>
            }
          />
        )}
      </View>
      <Modal visible={showScanner} animationType="slide">
        <QRScanner onScanComplete={handleScanComplete} onClose={() => setShowScanner(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  dateRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  label: { marginRight: 10, fontSize: 16, fontWeight: "500" },
});
