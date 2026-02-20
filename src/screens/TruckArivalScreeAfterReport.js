import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetTruckArrivalListAfterReport } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";
import CalendarInput from "../components/CalendarInput";

export default function TruckArivalScreeAfterReport() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState(thirtyDaysAgo.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(today.toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const { data, isLoading, isError, error, refetch } = useGetTruckArrivalListAfterReport(branchCode, fromDate, toDate, {
    staleTime: 0,
    cacheTime: 0,
    keepPreviousData: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    refetchOnReconnect: "always",
  });
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const normalizedQuery = searchQuery.replace(/\s+/g, "").toLowerCase();
    return data.filter((item) => {
      const normalizedVehicle = (item.vehicle || "").replace(/\s+/g, "").toLowerCase();
      return normalizedVehicle.includes(normalizedQuery);
    });
  }, [data, searchQuery]);

  const handleManifestPress = (thcNo, thcid) => {
    navigation.navigate("InwardesDetails", {
      thcId: thcid,
      thcNo: thcNo,
      toStation: branchCode,
      reportedType: "afterReport",
    });
  };

  const handleScannerPress = (thcid) => {
    navigation.navigate("DocketScanningScreen", { thcid });
  };

  if (!branchCode) {
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

  const renderCard = ({ item, index }) => (
    <View className="mx-3 mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
      <LinearGradient
        colors={[theme.colors.buttonPrimaryBg, theme.colors.buttonPrimaryText]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 56 }}
      >
        <View className="flex-row items-center justify-between px-2 h-full">
          <View className="flex-row items-center">
            <Text className="text-white text-lg font-extrabold">🚚 {item.vehicle || "N/A"}</Text>
          </View>
          <View className="flex-row items-center px-3 py-2 rounded-lg">
            <Text className="text-inputText font-semibold text-base ml-2">
              TAS No : <Text className="text-[#e30613]">{item?.tasNo ?? "0"}</Text>
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="font-semibold">📦 {item?.totalPackets ?? "0"}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-inputBackground px-3 py-1.5 rounded-full">
            <Text className="ml-1.5 font-semibold text-inputText">Branch : </Text>
            <Text className="ml-1.5 font-semibold text-inputText">{item?.branchCode ?? "N/A"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          <View className="flex-row items-center bg-inputBackground px-3 py-1.5 rounded-full">
            <Text className="ml-1.5 font-semibold text-inputText">THC No : </Text>
            <Text className="ml-1.5 font-semibold text-inputText">{item?.thcNo ?? "N/A"}</Text>
          </View>
        </View>

        <View className="border-t border-dashed border-gray-200 my-3" />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <View className="flex-row items-center justify-start">
              <Text className="font-semibold text-sm ms-5">TAS Time: </Text>
              <Text className="text-textPrimary text-sm">{item?.tasTime ? new Date(item.tasTime).toLocaleDateString() : "N/A"}</Text>
            </View>
            <View className="flex-row items-center justify-start">
              <Text className="font-semibold text-sm ms-5">Total Dockets: </Text>
              <Text className="text-textPrimary text-sm">{item?.totalDockets ?? "N/A"}</Text>
            </View>
            <View className="flex-row items-center justify-start">
              <Text className="font-semibold text-sm ms-5">Total Weight: </Text>
              <Text className="text-textPrimary text-sm">{item?.totalWeight ?? "N/A"}</Text>
            </View>
          </View>

          <View className="w-[1px] bg-inputBackground mx-3" />

          <View className="flex-1">
            <View className="flex-row items-center justify-start">
              <Text className="font-semibold text-sm">Pay Order: </Text>
              <Text className="text-textPrimary text-sm">
                {item?.vehiclePayOrderDate ? new Date(item.vehiclePayOrderDate).toLocaleDateString() : "N/A"}
              </Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Text className="font-semibold text-sm">Agg. Weight: </Text>
              <Text className="text-textPrimary text-sm">{item?.aggregatedTotalWeight ?? "N/A"}</Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Text className="font-semibold text-sm">Agg. CFT: </Text>
              <Text className="text-textPrimary text-sm">{item?.aggregatedTotalCFT ?? "N/A"}</Text>
            </View>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Button variant="primary" size="md" onPress={() => handleManifestPress(item.thcNo, item.thcid)} className="flex-1">
            <Text className="text-white font-semibold">Manifest</Text>
          </Button>
          <Button variant="primary" size="md" onPress={() => handleScannerPress(item.thcid)} className="flex-1">
            <View className="flex-row items-center justify-center">
              <Ionicons name="qr-code-outline" size={18} color={theme.colors.buttonPrimaryText} />
              <Text className="ml-2 text-white font-semibold" style={{ color: theme.colors.buttonPrimaryText }}>
                Scan
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );

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
          className="flex-row items-center rounded-xl px-4 py-3 border shadow-sm"
          style={{ backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder }}
        >
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            className="flex-1 ml-3 text-base text-inputText"
            placeholder="Search by vehicle number..."
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

      {/* Date Range Pickers */}
      <View className="mx-4 mt-2 mb-2 flex-row items-center gap-2">
        <View className="flex-1">
          <CalendarInput label="From Date" value={fromDate} onChange={setFromDate} maxDate={toDate} />
        </View>
        <Ionicons name="arrow-forward" size={16} color={theme.colors.inputText} />
        <View className="flex-1">
          <CalendarInput label="To Date" value={toDate} onChange={setToDate} minDate={fromDate} maxDate={today.toISOString().split("T")[0]} />
        </View>
      </View>

      {/* Truck List */}
      <View className="flex-1 mt-3">
        <FlatList
          data={filteredData}
          keyExtractor={(item, idx) => `${item?.vehicle ?? ""}${idx}`}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.buttonPrimaryBg]}
              tintColor={theme.colors.buttonPrimaryBg}
              title="Pull to refresh"
              titleColor={theme.colors.textSecondary}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-inputText text-base">{searchQuery ? "No vehicles found matching your search" : "No data found"}</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
