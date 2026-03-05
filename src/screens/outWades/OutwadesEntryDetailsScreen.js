import { useIsFocused } from "@react-navigation/native";
import { useState } from "react";
import { Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../../stores/themeStore";
import Loader from "../../components/Loader";

import { useGetAlsDetailsForSelectALS } from "../../../hooks/useApiQueries";

export default function OutwadesEntryDetailsScreen({ route }) {
  const theme = useCurrentTheme();
  const isFocused = useIsFocused();
  const { plsId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  ///----API CALL TO GET THE ALS DETAILS FOR THE SELECTED ALS IN OUTWARDS ENTRY SCREEN-----//

  const { data, isLoading, refetch, error } = useGetAlsDetailsForSelectALS(plsId, {
    enabled: isFocused && !!plsId,
  });

  console.log("ALS Details for the selected ALS in Outwards Entry Screen: ", data);

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

  ///----API CALL TO GET THE ALS DETAILS FOR THE SELECTED ALS IN OUTWARDS ENTRY SCREEN END-----//

  if (isLoading) {
    return <Loader visible={true} text="Loading details..." />;
  }

  const renderCard = ({ item }) => {
    return (
      <View
        className="overflow-hidden rounded-xl border"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderColor: theme.colors.cardBorder,
          marginBottom: 12,
        }}
      >
        <View className="p-3 ">
          <View className="mb-2.5 flex-row items-center justify-between">
            <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: theme.colors.buttonSecondaryBg }}>
              <Text className="text-[10px] font-semibold" style={{ color: theme.colors.primary }}>
                CROSSING STOCK
              </Text>
            </View>

            <Text className="text-sm font-semibold" style={{ color: theme.colors.accent }}>
              PLS ID: {item.plsId ?? "N/A"}
            </Text>
          </View>

          <Text className="mb-1 text-xl font-bold" style={{ color: theme.colors.headingText }}>
            Docket No: {item.docketNo ?? "N/A"}
          </Text>
        </View>

        <View className="border-t px-3 py-2.5" style={{ borderTopColor: theme.colors.cardBorder }}>
          <View className="mb-2.5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-2 h-2 w-2 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
              <Text className="text-xs font-medium" style={{ color: theme.colors.accent }}>
                TO STATION
              </Text>
            </View>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.headingText }}>
              {item.toStation ?? "N/A"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View
                className="mr-2 h-2 w-2 rounded-full border"
                style={{ borderColor: theme.colors.primary, backgroundColor: theme.colors.cardBg }}
              />
              <Text className="text-xs font-medium" style={{ color: theme.colors.accent }}>
                {item.deliveryBranch ?? "N/A"}
              </Text>
            </View>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.primary }}>
              Delivery Branch
            </Text>
          </View>
        </View>

        <View
          className="flex-row items-center justify-between border-y px-2 py-3"
          style={{ borderTopColor: theme.colors.cardBorder, borderBottomColor: theme.colors.cardBorder }}
        >
          <View className="flex-1 items-center px-1">
            <Text className="mb-0.5 text-[10px] font-semibold" style={{ color: theme.colors.accent }}>
              PACKETS
            </Text>
            <Text className="text-sm font-bold" style={{ color: theme.colors.headingText }}>
              {item.totalPackets ?? "N/A"} Pkts
            </Text>
          </View>

          <View className="h-12 w-px" style={{ backgroundColor: theme.colors.cardBorder }} />

          <View className="flex-1 items-center px-1">
            <Text className="mb-0.5 text-[10px] font-semibold" style={{ color: theme.colors.accent }}>
              WEIGHT
            </Text>
            <Text className="text-sm font-bold" style={{ color: theme.colors.headingText }}>
              {item.stockWeight ?? "N/A"}
            </Text>
          </View>

          <View className="h-12 w-px" style={{ backgroundColor: theme.colors.cardBorder }} />

          <View className="flex-1 items-center px-1">
            <Text className="mb-0.5 text-[10px] font-semibold" style={{ color: theme.colors.accent }}>
              VOLUME
            </Text>
            <Text className="text-sm font-bold text-center leading-6" style={{ color: theme.colors.headingText }}>
              {item.stockCFT ?? "N/A"} CFT
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.appBg }} edges={["left", "right"]}>
      <FlatList
        data={data}
        renderItem={renderCard}
        keyExtractor={(item, index) => {
          return item.alT_ID?.toString() || `direct-als-${index}`;
        }}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text style={{ color: theme.colors.accent }}>{"No preloading data found"}</Text>
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
    </SafeAreaView>
  );
}
