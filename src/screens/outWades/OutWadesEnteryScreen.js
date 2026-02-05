import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, View } from "react-native";
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
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  function toHierarchyLevels(str) {
    return str.split("-").join(" -> ");
  }

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
    const selectedItem = data.find((item) => item.id === selectedCardId);
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
        alsId: selectedItem.id,
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
  const { data, isLoading, isError, error } = useGetPreloadingList(branchCode, finCode, false, {
    enabled: isFocused && !!branchCode && !!finCode,
  });
  // Reset selectedCardId when page loses focus
  useEffect(() => {
    if (!isFocused) {
      setSelectedCardId(null);
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [isFocused]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Loading data…</Text>
      </View>
    );
  }

  const renderPreloadingCard = ({ item }) => (
    <View
      className="bg-white rounded-2xl p-4 mb-3 shadow-lg"
      style={{
        borderWidth: selectedCardId === item.id ? 2 : 0,
        borderColor: selectedCardId === item.id ? theme.colors.alertColor : "transparent",
        backgroundColor: selectedCardId === item.id ? theme.colors.cardBg : "white",
      }}
      onTouchEnd={() => setSelectedCardId(selectedCardId === item.id ? null : item.id)}
    >
      <View className="flex-row justify-between mb-3">
        <View>
          <Text className="text-xs" style={{ color: theme.colors.inputText }}>
            PLS NO
          </Text>
          <Text className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
            {item.plsNo}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs" style={{ color: theme.colors.inputText }}>
            DATE
          </Text>
          <Text className="font-semibold" style={{ color: theme.colors.textPrimary }}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View className="mb-3">
        <Text className="text-xs mb-1" style={{ color: theme.colors.inputText }}>
          ROUTE
        </Text>
        <Text className="font-semibold" style={{ color: theme.colors.textPrimary }}>
          {toHierarchyLevels(item.routeDetails)}
        </Text>
      </View>

      <View className="flex-row flex-wrap">
        <View className="w-1/2 mb-2">
          <Text className="text-xs" style={{ color: theme.colors.inputText }}>
            DOCKETS
          </Text>
          <Text className="font-bold" style={{ color: theme.colors.textPrimary }}>
            {item.totalDockets || 0}
          </Text>
        </View>
        <View className="w-1/2 mb-2">
          <Text className="text-xs" style={{ color: theme.colors.inputText }}>
            PACKETS
          </Text>
          <Text className="font-bold" style={{ color: theme.colors.textPrimary }}>
            {item.totalPackets || 0}
          </Text>
        </View>
        <View className="w-1/2">
          <Text className="text-xs" style={{ color: theme.colors.inputText }}>
            WEIGHT
          </Text>
          <Text className="font-bold" style={{ color: theme.colors.textPrimary }}>
            {item.totalWeight || 0} kg
          </Text>
        </View>
        <View className="w-1/2">
          <Text className="text-xs" style={{ color: theme.colors.inputText }}>
            CFT
          </Text>
          <Text className="font-bold" style={{ color: theme.colors.textPrimary }}>
            {item.totalCFT || 0}
          </Text>
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
        data={data}
        renderItem={renderPreloadingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        scrollEnabled={true}
      />

      {/* Bottom Buttons */}
      <View className=" px-4 flex-row gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onPress={onHandleDirectALS}>
          Direct ALS
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onPress={onHandleProceedToALS}>
          Proceed to ALS
        </Button>
      </View>
    </View>
  );
}
