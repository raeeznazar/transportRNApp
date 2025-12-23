import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";

export default function TruckUnloadingScreen() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingItemId, setLoadingItemId] = useState(null);

  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;

  // Mock data - replace with your actual API call
  const [data, setData] = useState([
    {
      id: 1,
      docketNo: "DKT-88231",
      totalPackets: 45,
      destination: "Zone A-12",
      dueTime: "14:00 PM",
      status: "pending", // pending, in-progress, completed
      scannedPackets: 0,
    },
    {
      id: 2,
      docketNo: "DKT-88232",
      totalPackets: 12,
      destination: "Zone B-8",
      dueTime: "15:30 PM",
      status: "in-progress",
      scannedPackets: 5,
    },
    {
      id: 3,
      docketNo: "DKT-88234",
      totalPackets: 8,
      destination: "Zone C-3",
      dueTime: "16:00 PM",
      status: "pending",
      scannedPackets: 0,
    },
  ]);

  const isLoading = false;

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;
    const normalizedQuery = searchQuery.replace(/\s+/g, "").toLowerCase();
    return data.filter((item) => {
      const normalizedDocketNo = item.docketNo?.replace(/\s+/g, "").toLowerCase() || "";
      return normalizedDocketNo.includes(normalizedQuery);
    });
  }, [data, searchQuery]);

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
        <Text className="mt-2 text-inputText">Loading dockets…</Text>
      </View>
    );
  }

  const handleViewMore = (item) => {
    // Navigate to details screen
    console.log("View more:", item);
  };

  const handleScan = (item) => {
    if (item.status === "in-progress") {
      // Resume scanning
      console.log("Resume scanning:", item);
    } else {
      // Start scanning
      console.log("Start scanning:", item);
    }
    // Navigate to scanning screen or open scanner modal
  };

  const renderCard = ({ item, index }) => (
    <View className="mx-3 mb-4 rounded-2xl overflow-hidden shadow-lg border border-gray-100 bg-white">
      <LinearGradient
        colors={[theme.colors.buttonPrimaryBg, theme.colors.buttonPrimaryText]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 50 }}
      >
        <View className="flex-row items-center justify-between px-5 h-full">
          <View className="flex-1">
            <Text className="text-white text-2xl font-extrabold tracking-tight">{item.docketNo}</Text>
          </View>
        </View>
      </LinearGradient>

      <View className="px-5 py-3">
        <View className="flex-row items-center mb-4">
          <Ionicons name="cube-outline" size={18} color={theme.colors.inputText} />
          <Text className="ml-2 text-sm font-semibold text-inputText">
            Total Packets: <Text style={{ color: theme.colors.alertColor }}>{item.totalPackets}</Text>
          </Text>
          {item.status === "in-progress" && (
            <Text className="ml-auto text-sm font-semibold text-inputText">
              Scanned: <Text style={{ color: theme.colors.buttonPrimaryBg }}>{item.scannedPackets}</Text>
            </Text>
          )}
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-inputBackground px-3 py-3 rounded-2xl">
            <Text className="text-xs text-inputText mb-1">Destination</Text>
            <Text className="font-bold text-sm text-textPrimary truncate">{item.destination}</Text>
          </View>
          <View className="flex-1 bg-inputBackground px-3 py-3 rounded-2xl">
            <Text className="text-xs text-inputText mb-1">Due Time</Text>
            <Text className="font-bold text-sm text-textPrimary truncate">{item.dueTime}</Text>
          </View>
        </View>

        {item.status === "in-progress" && (
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xs text-inputText">Progress</Text>
              <Text className="text-xs font-semibold text-inputText">{Math.round((item.scannedPackets / item.totalPackets) * 100)}%</Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${(item.scannedPackets / item.totalPackets) * 100}%`,
                  backgroundColor: theme.colors.buttonPrimaryBg,
                }}
              />
            </View>
          </View>
        )}
      </View>

      <View className="px-4 pb-4 pt-2 bg-gray-50/50 border-t border-gray-100">
        <View className="flex-row gap-3">
          <Button variant="outline" size="md" onPress={() => handleViewMore(item)} disabled={!!loadingItemId} className="flex-1">
            View More
          </Button>
          <Button variant="primary" size="md" onPress={() => handleScan(item)} disabled={!!loadingItemId} className="flex-[1.5]">
            <View className="flex-row items-center justify-center gap-2">
              <Ionicons name="qr-code-outline" size={18} color="#fff" />
              <Text className="text-white font-bold">{item.status === "in-progress" ? "Resume" : "Scan"}</Text>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      {/* Search Input */}
      <View className="mx-4 mt-4 mb-4">
        <View
          className="flex-row items-center rounded-xl px-4 py-3.5 border shadow-sm"
          style={{ backgroundColor: theme.colors.inputBg, borderColor: theme.colors.inputBorder }}
        >
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <TextInput
            className="flex-1 ml-3 text-base text-inputText"
            placeholder="Search docket number..."
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

      {/* Docket List */}
      <View className="flex-1">
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
              <Text className="text-inputText text-base mt-4">{searchQuery ? "No dockets found matching your search" : "No active dockets"}</Text>
            </View>
          }
          ListFooterComponent={
            filteredData.length > 0 ? (
              <View className="py-6">
                <Text className="text-center text-sm text-gray-400">End of active dockets</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
