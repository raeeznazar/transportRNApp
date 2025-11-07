import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Tooltip from "react-native-walkthrough-tooltip";
import { theme } from "../../constants/theme";
import { useGetInward } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import QRScanner from "../components/QRScanner";

export default function InwadesScreen() {
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
  const [showFromBranchTipIndex, setShowFromBranchTipIndex] = useState(null);
  const [showToBranchTipIndex, setShowToBranchTipIndex] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const modifiedFromDate = formatDate(fromDate);
  const modifiedToDate = formatDate(toDate);
  const { data, isLoading, isError, error, refetch } = useGetInward(branchCode, modifiedFromDate, modifiedToDate);

  console.log("branchCode, modifiedFromDate, modifiedToDate:", branchCode, modifiedFromDate, modifiedToDate);

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

  const handleViewDetails = () => {
    navigation.navigate("InwardesDetails", {
      inwardId: "25",
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

  const renderCard = ({ item, index }) => (
    <View className="mx-3 mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
      <LinearGradient
        colors={[theme.colors.buttonBackground, theme.colors.inputBackground]}
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
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center px-3 py-2 rounded-full shadow-sm active:opacity-80"
            style={{ backgroundColor: theme.colors.alertColor }}
            onPress={() => InwardScanning()}
          >
            <Ionicons name="alert-circle-outline" size={16} color="#fff" />
            <Text className="text-white font-semibold text-sm ml-1.5">Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleViewDetails}
            className="flex-1 flex-row items-center justify-center px-3 py-2 rounded-full shadow-sm active:opacity-80"
            style={{ backgroundColor: theme.colors.buttonBackground }}
          >
            <Ionicons name="reader-outline" size={16} color="#fff" />
            <Text className="text-white font-semibold text-sm ml-1.5">Manifest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleViewDetails}
            className="flex-1 flex-row items-center justify-center px-3 py-2 rounded-full shadow-sm active:opacity-80"
            style={{ backgroundColor: theme.colors.buttonBackground }}
          >
            <Ionicons name="reader-outline" size={16} color="#fff" />
            <Text className="text-white font-semibold text-sm ml-1.5">Arrival</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      {/* Search Input */}
      <View className="mx-4 mt-4 mb-2">
        <View className="flex-row items-center bg-inputBackground rounded-lg px-3 py-2 border border-gray-200">
          <Ionicons name="search-outline" size={20} color={theme.colors.inputText} />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by truck number..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.inputText}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.inputText} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text className="mt-1 text-sm text-gray-500 ml-1">
            Found {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>
      {/* <View className="flex-row justify-around mt-1">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-bold text-base">From </Text>
          <Button title={fromDate.toLocaleDateString()} onPress={() => setShowFrom(true)} />
        </View>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-bold text-base">To </Text>
          <Button title={toDate.toLocaleDateString()} onPress={() => setShowTo(true)} />
        </View>
      </View> */}
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
