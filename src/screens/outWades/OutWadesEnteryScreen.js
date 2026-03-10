import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetOutwadesDirectALSList, useGetPreloadingList } from "../../../hooks/useApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import BottomActionBar from "../../components/BottomActionBar";
import { Button } from "../../components/Button";
import { ScanToast } from "../../components/ScanToast";
export default function OutWadesEnteryScreen() {
  const theme = useCurrentTheme();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const finCode = sessionData?.finCode;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("preloading");
  const [selectedPreloadingCardId, setSelectedPreloadingCardId] = useState(null);
  const [selectedDirectALSAltId, setSelectedDirectALSAltId] = useState(null);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const { data, isLoading, refetch, error } = useGetPreloadingList(branchCode, finCode, false, {
    enabled: isFocused && !!branchCode && !!finCode,
    LedgerFilter: "",
    CustomerFilter: "",
  });
  const {
    data: directALSData,
    isLoading: isDirectALSLoading,
    refetch: refetchDirectALS,
    error: directALSError,
  } = useGetOutwadesDirectALSList(branchCode, {
    enabled: isFocused && !!branchCode,
  });

  console.log("Preloading List Data:", data);
  console.log("Direct ALS List Data:", directALSData);

  // Filter out items with totalDockets === 0
  const filteredPreloadingData = data?.filter((item) => item.totalDockets > 0) || [];
  const normalizedDirectALSData = Array.isArray(directALSData) ? directALSData : directALSData ? [directALSData] : [];

  useFocusEffect(
    useCallback(() => {
      if (isFocused && sessionData?.branchCode && finCode) {
        refetch();
      }
      if (isFocused && sessionData?.branchCode) {
        refetchDirectALS();
      }
    }, [isFocused, sessionData?.branchCode, finCode, refetch, refetchDirectALS])
  );

  // Reset selectedCardId when page loses focus
  useEffect(() => {
    if (!isFocused) {
      setSelectedPreloadingCardId(null);
      setSelectedDirectALSAltId(null);
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [isFocused]);

  function onHandleProceedToALS() {
    if (!selectedPreloadingCardId) {
      setToastConfig({
        visible: true,
        type: "warning",
        title: "No Card Selected",
        message: "Please select a preloading card to proceed.",
      });
      return;
    }
    const selectedItem = filteredPreloadingData.find((item) => item.id === selectedPreloadingCardId);
    setToastConfig({
      visible: true,
      type: "success",
      title: "Card Selected",
      message: `Processing preloading card ${selectedPreloadingCardId}`,
    });
    setTimeout(() => {
      navigation.navigate("OutWadesALSscreen", {
        date: selectedItem.date,
        routeDetails: selectedItem.routeDetails,
        dockets: selectedItem.totalDockets,
        packets: selectedItem.totalPackets,
        weight: selectedItem.totalWeight,
        cft: selectedItem.totalCft,
        plsNo: selectedItem.plsNo,
        altId: selectedItem.id,
      });
    }, 600);
  }

  function onHandleDirectToALS() {
    setToastConfig({
      visible: true,
      type: "success",
      title: "Direct to ALS",
      message: "Navigating to direct ALS list",
    });
    setTimeout(() => {
      navigation.navigate("OutWadesDirectALS");
    }, 600);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "preloading") {
        await refetch();
      } else {
        await refetchDirectALS();
      }
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if ((activeTab === "preloading" && isLoading) || (activeTab === "directALS" && isDirectALSLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Loading data…</Text>
      </View>
    );
  }

  if ((activeTab === "preloading" && error) || (activeTab === "directALS" && directALSError)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Server error loading data…</Text>
      </View>
    );
  }

  const renderPreloadingCard = ({ item }) => {
    return (
      <View
        className="rounded-2xl mb-2 overflow-hidden"
        style={{
          backgroundColor: selectedPreloadingCardId === item.id ? "#F0F4FF" : theme.colors.cardBg,
          borderWidth: selectedPreloadingCardId === item.id ? 2 : 1,
          borderColor: selectedPreloadingCardId === item.id ? theme.colors.primary : "#f7fafc",
          shadowColor: selectedPreloadingCardId === item.id ? theme.colors.primary : "#000",
          shadowOffset: { width: 0, height: selectedPreloadingCardId === item.id ? 6 : 2 },
          shadowOpacity: selectedPreloadingCardId === item.id ? 0.12 : 0.06,
          shadowRadius: selectedPreloadingCardId === item.id ? 12 : 6,
          elevation: selectedPreloadingCardId === item.id ? 6 : 2,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // Prevent selection if alT_ID is not 0
            if (item.alT_ID !== 0) {
              return; // Do nothing if alT_ID is not 0
            }
            setSelectedPreloadingCardId(selectedPreloadingCardId === item.id ? null : item.id);
          }}
        >
          <View className="px-4 py-3">
            {/* PLS NO & DATE Header */}
            <View className="flex-row justify-between mb-3 pb-3" style={{ borderBottomWidth: 1, borderBottomColor: "#E8EBF0" }}>
              <View className="flex-1">
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.accent }}>
                  PLS NO
                </Text>
                <Text className="text-lg font-semibold" style={{ color: theme.colors.primary }}>
                  {item.plsNo}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.accent }}>
                  DATE
                </Text>
                <Text className="text-sm font-medium" style={{ color: theme.colors.headingText }}>
                  {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
              </View>
            </View>

            {/* ROUTE */}
            <View className="mb-3">
              <Text className="text-xs font-semibold mb-2" style={{ color: theme.colors.accent }}>
                ROUTE
              </Text>
              <View className="flex-row items-center gap-1.5 flex-wrap">
                {item.routeDetails.split("-").map((route, index) => (
                  <View key={index} className="flex-row items-center">
                    <View
                      className="px-2.5 py-1 rounded-lg border"
                      style={{
                        backgroundColor: "#F9FAFB",
                        borderColor: theme.colors.buttonSecondaryBorder,
                      }}
                    >
                      <Text className="font-medium text-xs" style={{ color: theme.colors.primary }}>
                        {route.trim()}
                      </Text>
                    </View>
                    {index < item.routeDetails.split("-").length - 1 && (
                      <Text className="mx-0.5 font-semibold text-xs" style={{ color: theme.colors.accent }}>
                        →
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* DOCKETS, PACKETS, WEIGHT, CFT */}
            <View className="flex-row " style={{ borderBottomColor: "#E8EBF0" }}>
              <View className="flex-1">
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.accent }}>
                  DOCKETS
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.headingText }}>
                  {item.totalDockets || 0}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.accent }}>
                  PACKETS
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.headingText }}>
                  {item.totalPackets || 0}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.accent }}>
                  WEIGHT
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.headingText }}>
                  {item.totalWeight || 0}t
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.accent }}>
                  CFT
                </Text>
                <Text className="text-base font-semibold" style={{ color: theme.colors.headingText }}>
                  {item.totalCFT || 0}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3 px-4 py-1" style={{ borderTopWidth: 1, borderTopColor: theme.colors.buttonSecondaryBorder }}>
          <TouchableOpacity
            className={item.alT_ID !== 0 ? "flex-1 flex-row items-center gap-2 py-2" : "w-full flex-row items-center justify-center gap-2 py-2"}
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate("OutwadesEntryDetailsScreen", { plsId: item.plsNo });
            }}
          >
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.headingText} />
            <Text className="text-sm font-semibold" style={{ color: theme.colors.headingText }}>
              View Detail
            </Text>
          </TouchableOpacity>

          {item.alT_ID !== 0 && (
            <View style={{ width: 170 }}>
              <Button variant="primary" size="sm" className="w-full" onPress={() => navigation.navigate("OutWadesScanning", { altId: item.alT_ID })}>
                Resume
              </Button>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDirectALSCard = ({ item }) => {
    const isSelected = selectedDirectALSAltId === item.alT_ID;
    return (
      <View
        className="rounded-2xl mb-2 overflow-hidden"
        style={{
          backgroundColor: isSelected ? "#F0F4FF" : theme.colors.cardBg,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? theme.colors.primary : "#f7fafc",
          shadowColor: isSelected ? theme.colors.primary : "#000",
          shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
          shadowOpacity: isSelected ? 0.12 : 0.06,
          shadowRadius: isSelected ? 12 : 6,
          elevation: isSelected ? 6 : 2,
        }}
      >
        <View className="px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <FontAwesome name="truck" size={20} color={theme.colors.primary} />

              <Text className="text-sm font-bold" style={{ color: theme.colors.headingText }}>
                ALT ID {item.alT_ID ?? 0}
              </Text>
            </View>
            <View className="px-3 py-1.5 rounded-full" style={{ backgroundColor: `${theme.colors.primary}1A` }}>
              <Text className="text-sm  tracking-wide" style={{ color: theme.colors.primary }}>
                {(item.status || "IN TRANSIT").toUpperCase()}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-6">
            <View className="flex-row items-center gap-2">
              <Ionicons name="document-text-outline" size={18} color={theme.colors.accent} />
              <Text className="text-sm " style={{ color: theme.colors.headingText }}>
                Dockets: {item.docketCount || 0}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Ionicons name="cube-outline" size={18} color={theme.colors.accent} />
              <Text className="text-sm " style={{ color: theme.colors.headingText }}>
                Packets: {item.totalPackets || 0}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-3 px-4 py-2" style={{ borderTopWidth: 1, borderTopColor: theme.colors.buttonSecondaryBorder }}>
          {/* <TouchableOpacity
            className={item.alT_ID !== 0 ? "flex-1 flex-row items-center gap-2 py-2" : "w-full flex-row items-center justify-center gap-2 py-2"}
            activeOpacity={0.7}
            onPress={() => {
              navigation.navigate("OutwadesEntryDetailsScreen");
            }}
          >
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.headingText} />
            <Text className="text-sm font-semibold" style={{ color: theme.colors.headingText }}>
              View Detail
            </Text>
          </TouchableOpacity> */}

          {item.alT_ID !== 0 && (
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Button variant="primary" size="sm" onPress={() => navigation.navigate("OutWadesScanning", { altId: item.alT_ID, isDirect: true })}>
                Resume
              </Button>
            </View>
          )}
        </View>
      </View>
    );
  };

  const activeListData = activeTab === "preloading" ? filteredPreloadingData : normalizedDirectALSData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.appBg }} edges={["left", "right"]}>
      <View
        style={{
          flex: 1,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: theme.colors.appBg,
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Custom Scan Toast */}
        <ScanToast
          visible={toastConfig.visible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onHide={() => setToastConfig({ ...toastConfig, visible: false })}
        />

        {normalizedDirectALSData.length > 0 && (
          <View className="px-4 pt-4 pb-2">
            <View className="flex-row rounded-xl p-1" style={{ backgroundColor: theme.colors.cardBg }}>
              <TouchableOpacity
                className="flex-1 items-center py-2 rounded-lg"
                style={{
                  backgroundColor: activeTab === "preloading" ? theme.colors.primary : "transparent",
                }}
                onPress={() => setActiveTab("preloading")}
              >
                <Text style={{ color: activeTab === "preloading" ? theme.colors.buttonPrimaryText : theme.colors.headingText, fontWeight: "600" }}>
                  ALS ({filteredPreloadingData.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center py-2 rounded-lg"
                style={{
                  backgroundColor: activeTab === "directALS" ? theme.colors.primary : "transparent",
                }}
                onPress={() => setActiveTab("directALS")}
              >
                <Text style={{ color: activeTab === "directALS" ? theme.colors.buttonPrimaryText : theme.colors.headingText, fontWeight: "600" }}>
                  Direct ({normalizedDirectALSData.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <FlatList
          data={activeListData}
          renderItem={activeTab === "preloading" ? renderPreloadingCard : renderDirectALSCard}
          keyExtractor={(item, index) => {
            if (activeTab === "preloading") {
              return item.id?.toString() || `preloading-${index}`;
            }
            return item.alT_ID?.toString() || `direct-als-${index}`;
          }}
          ListEmptyComponent={
            <View className="items-center py-8">
              <Text style={{ color: theme.colors.accent }}>
                {activeTab === "preloading" ? "No preloading data found" : "No direct ALS data found"}
              </Text>
            </View>
          }
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 20,
          }}
          scrollEnabled={true}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />

        {activeTab === "preloading" && (
          <BottomActionBar includeBottomInset={false}>
            <View className="flex-row gap-3">
              <Button variant="primary" size="lg" className="flex-1" onPress={onHandleDirectToALS}>
                Direct to ALS
              </Button>

              <Button variant="primary" size="lg" className="flex-1" onPress={onHandleProceedToALS}>
                Proceed to ALS
              </Button>
            </View>
          </BottomActionBar>
        )}
      </View>
    </SafeAreaView>
  );
}
