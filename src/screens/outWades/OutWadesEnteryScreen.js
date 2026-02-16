import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetPreloadingList } from "../../../hooks/useApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import { Button } from "../../components/Button";
import { ScanToast } from "../../components/ScanToast";
export default function OutWadesEnteryScreen() {
  const theme = useCurrentTheme();
  const { sessionData } = useAuthStore();
  const branchCode = sessionData?.branchCode;
  const finCode = sessionData?.finCode;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const [selectedCardId, setSelectedCardId] = useState(null);
  const navigation = useNavigation();
  const resumeKey = true;
  const [refreshing, setRefreshing] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const { data, isLoading, refetch, isError, error } = useGetPreloadingList(branchCode, finCode, false, {
    enabled: isFocused && !!branchCode && !!finCode,
  });

  // Filter out items with totalDockets === 0
  const filteredPreloadingData = data?.filter((item) => item.totalDockets > 0) || [];

  useFocusEffect(
    useCallback(() => {
      if (isFocused && sessionData?.branchCode && finCode) {
        refetch();
      }
    }, [isFocused, sessionData?.branchCode, finCode, refetch])
  );

  // Reset selectedCardId when page loses focus
  useEffect(() => {
    if (!isFocused) {
      setSelectedCardId(null);
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [isFocused]);

  function onHandleProceedToALS() {
    if (!selectedCardId) {
      setToastConfig({
        visible: true,
        type: "warning",
        title: "No Card Selected",
        message: "Please select a preloading card to proceed.",
      });
      return;
    }
    const selectedItem = filteredPreloadingData.find((item) => item.id === selectedCardId);
    setToastConfig({
      visible: true,
      type: "success",
      title: "Card Selected",
      message: `Processing preloading card ${selectedCardId}`,
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
  function onHandleDirectALS() {
    setSelectedCardId(null);
    setToastConfig({
      visible: true,
      type: "success",
      title: "Direct ALS Selected",
      message: `Processing direct ALS`,
    });
    setTimeout(() => {
      navigation.navigate("OutWadesDirectALS");
    }, 600);
  }

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Loading data…</Text>
      </View>
    );
  }

  if (error) {
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
          backgroundColor: selectedCardId === item.id ? "#F0F4FF" : theme.colors.cardBg,
          borderWidth: selectedCardId === item.id ? 2 : 1,
          borderColor: selectedCardId === item.id ? theme.colors.primary : "#f7fafc",
          shadowColor: selectedCardId === item.id ? theme.colors.primary : "#000",
          shadowOffset: { width: 0, height: selectedCardId === item.id ? 6 : 2 },
          shadowOpacity: selectedCardId === item.id ? 0.12 : 0.06,
          shadowRadius: selectedCardId === item.id ? 12 : 6,
          elevation: selectedCardId === item.id ? 6 : 2,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            // Prevent selection if alT_ID is not 0
            if (item.alT_ID !== 0) {
              return; // Do nothing if alT_ID is not 0
            }
            setSelectedCardId(selectedCardId === item.id ? null : item.id);
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

        {/* REMOVE PACKETS Button */}
        {item.alT_ID !== 0 && (
          <TouchableOpacity
            onPress={() => {
              // Handle remove packets action
              navigation.navigate("OutWadesScanning", { altId: item.alT_ID });
            }}
            activeOpacity={0.6}
          >
            <View
              className="items-center py-3 px-4"
              style={{ borderTopWidth: 1, borderTopColor: "#f0efe8ff", backgroundColor: theme.colors.primary + "1A" }}
            >
              <Text className="font-medium text-md font-semibold" style={{ color: theme.colors.primary }}>
                Resume
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
      {/* Header */}
      {/* <View className="bg-white px-4 py-4">
        <Text className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>
          Pending Preloading
        </Text>
      </View> */}

      {/* Content */}
      {/* Custom Scan Toast */}
      <ScanToast
        visible={toastConfig.visible}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        onHide={() => setToastConfig({ ...toastConfig, visible: false })}
      />
      <FlatList
        data={filteredPreloadingData}
        renderItem={renderPreloadingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        scrollEnabled={true}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* Bottom Buttons */}
      <View className="px-4 flex-row gap-3" style={{ paddingBottom: insets.bottom, paddingTop: insets.top, backgroundColor: theme.colors.appBg }}>
        {/* <Button variant="secondary" size="lg" className="flex-1" onPress={onHandleDirectALS}>
          Direct ALS
        </Button> */}
        <Button variant="primary" size="lg" className="flex-1" onPress={onHandleProceedToALS}>
          Proceed to ALS
        </Button>
      </View>
    </View>
  );
}
