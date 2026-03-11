import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "../../../hooks/useDebounce";
import { useGetDeliveryReceiptList } from "../../../hooks/useDeliveryApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import DateRange from "../../components/DateRange";
import ErrorScreen from "../../components/ErrorScreen";
import InputSearch from "../../components/InputSearch";
import { formatDate } from "../../utils/dateUtility";
import { money } from "../../utils/moneyUtility";

// --------------------------------------- Design component card ---------------------------------------//
function ShipmentCard({ item, theme, onPress }) {
  return (
    <View
      className="mb-3.5 rounded-2xl border p-4"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.cardBorder,
        shadowColor: theme.colors.headingText,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      activeOpacity={0.85}
    >
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="mb-0.5 text-[16px] font-bold" style={{ color: theme.colors.primary }}>
              Receipt No : {item.rcptNo}
            </Text>
            <Text className="text-[10px] font-medium" style={{ color: theme.colors.inputPlaceholder }}>
              Docket : {item.docketNo}
            </Text>
          </View>

          <View className="items-end">
            <Text className="mb-0.5 text-[18px] font-bold" style={{ color: theme.colors.headingText }}>
              {money(item.totalAmount)}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="time-outline" size={12} color={theme.colors.inputPlaceholder} />
              <Text className="text-[10px] font-medium" style={{ color: theme.colors.inputPlaceholder }}>
                {formatDate(item.rcptDate)}
              </Text>
            </View>
          </View>
        </View>

        <View className="my-3 h-px" style={{ backgroundColor: theme.colors.cardBorder }} />

        <View className="flex-row items-center justify-between">
          <View className="mr-2 flex-1 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: theme.colors.buttonSecondaryBg }}>
              <Ionicons name="business-outline" size={18} color={theme.colors.bodyText} />
            </View>
            <View>
              <Text className="mb-0.5 text-[12px] font-semibold" style={{ color: theme.colors.headingText }}>
                {item.customer}
              </Text>
              <Text className="text-[10px] font-medium" style={{ color: theme.colors.inputPlaceholder }}>
                {item.rcptType} Delivery
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={theme.colors.inputBorder} />
        </View>
      </TouchableOpacity>
    </View>
  );
}
// --------------------------------------- Design component card END ---------------------------------------//

export default function DeliveryReciptEntry() {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [fromDate, setFromDate] = useState(null); // "YYYY-MM-DD"
  const [toDate, setToDate] = useState(null);
  const now = new Date();
  const { sessionData } = useAuthStore();
  const isFocused = useIsFocused();
  const branchCode = sessionData?.branchCode;
  const finCode = sessionData?.finCode;
  const entryUser = sessionData?.userName;
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const rcptType = "DOOR";
  const pageSize = 10;
  const sortColumn = "";
  const sortDirection = "";

  // Debounce the search input by 500ms
  const debouncedSearch = useDebounce(search, 600);

  ///-------------------------------- API CALLS -----------------------------///
  const { data, isLoading, isFetching, refetch, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetDeliveryReceiptList(
    finCode,
    rcptType,
    fromDate,
    toDate,
    pageSize,
    sortColumn,
    sortDirection,
    {
      enabled: isFocused && !!finCode && !!pageSize, // only fetch when screen is focused and required params are available
      searchText: debouncedSearch, // pass debounced search value
    }
  );
  const DeliveryReceiptList = data?.pages?.flatMap((page) => page) || [];
  console.log("Delivery Receipt List:", DeliveryReceiptList);

  ///-------------------------------- API CALLS END -----------------------------///

  ///-----------------ERROR HANDLING-----------------------------///
  if (error) {
    return <ErrorScreen error={error} onRetry={refetch} />;
  }
  ///-----------------ERROR HANDLING END-----------------------------///

  ///--------------------------------PAGINATION LOGIC-----------------------------///

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

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  ///--------------------------------PAGINATION LOGIC END-----------------------------///

  ////-------------------------------- RENDER FOOTER -----------------------------///

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: 20, alignItems: "center" }}>
          <ActivityIndicator size="small" color={theme.colors.accent} />
          <Text style={{ color: theme.colors.bodyText, fontSize: 12, marginTop: 6 }}>Loading more...</Text>
        </View>
      );
    }
    if (!hasNextPage && DeliveryReceiptList.length > 0) {
      return <Text style={{ textAlign: "center", paddingVertical: 12, color: theme.colors.bodyText, fontSize: 12 }}>No more data</Text>;
    }
    return null;
  };

  //-------------------------------- RENDER FOOTER END -----------------------------///

  return (
    <View className="flex-1 px-4 pt-3.5" style={{ backgroundColor: theme.colors.appBg }}>
      <InputSearch value={search} onChangeText={setSearch} placeholder="Search by Docket number..." />

      <View style={{ marginTop: 12 }}>
        <DateRange
          label="Select date range"
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onChange={({ fromDate, toDate }) => {
            console.log("range:", fromDate, toDate);
          }}
          displayFormat="DD MMM YY"
          autoCloseOnComplete={true}
          onRangeComplete={({ fromDate, toDate }) => {
            console.log("Range complete:", fromDate, toDate);
          }}
        />
      </View>
      <FlatList
        data={DeliveryReceiptList}
        keyExtractor={(item, index) => `${item.rcptID}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 + insets.bottom, paddingTop: 16 }}
        renderItem={({ item }) => (
          <ShipmentCard
            item={item}
            theme={theme}
            onPress={() => {
              navigation.navigate("DeliveryEntryDetailsPage", { receipt: item });
            }}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 32, gap: 10 }}>
              <ActivityIndicator size="large" color={theme.colors.accent} />
              <Text style={{ color: theme.colors.bodyText, fontSize: 13 }}>Loading data...</Text>
            </View>
          ) : (
            <Text className="text-center justify-center py-2">No Data Found</Text>
          )
        }
        ListFooterComponent={renderFooter}
        scrollEnabled={true}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
      />
      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate("CreateDeliveryReciptEntryScreen")}
        style={[
          fabStyles.fab,
          {
            bottom: 5 + insets.bottom,
            backgroundColor: theme.colors.primary,
          },
        ]}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create delivery receipt"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const fabStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
});
