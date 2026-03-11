import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { ScrollView, Text, View } from "react-native";
import { useCurrentTheme } from "../../../stores/themeStore";
import { formatDate } from "../../utils/dateUtility";
import { money } from "../../utils/moneyUtility";

export default function DeliveryEntryDetailsPage() {
  const theme = useCurrentTheme();
  const route = useRoute();
  const receipt = route.params?.receipt;

  // If no receipt data, show placeholder or error
  if (!receipt) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.appBg }}>
        <Text style={{ color: theme.colors.bodyText }}>No data available</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      <View className="p-4">
        {/* Main Card */}
        <View
          className="bg-white rounded-2xl p-6 mb-4"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
        >
          {/* Order Number */}
          <View className="items-center mb-3">
            <Text className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
              #{receipt.rcptNo}
            </Text>
          </View>

          {/* Total Amount Label */}
          <View className="items-center mb-2">
            <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
              Total Amount
            </Text>
          </View>

          {/* Amount */}
          <View className="items-center mb-5">
            <Text className="text-3xl font-bold" style={{ color: theme.colors.headingText }}>
              {money(receipt.totalAmount)}
            </Text>
          </View>

          {/* Payment Type Badges */}
          <View className="flex-row justify-center gap-3">
            <View className="bg-gray-100 px-4 py-2 rounded-lg flex-row items-center">
              <MaterialCommunityIcons name="door-open" size={16} color={theme.colors.bodyText} />
              <Text className="ml-2 text-xs font-medium" style={{ color: theme.colors.bodyText }}>
                {receipt.rcptType}
              </Text>
            </View>
            <View className="bg-gray-100 px-4 py-2 rounded-lg flex-row items-center">
              <MaterialCommunityIcons name="credit-card" size={16} color={theme.colors.bodyText} />
              <Text className="ml-2 text-xs font-medium" style={{ color: theme.colors.bodyText }}>
                CREDIT
              </Text>
            </View>
          </View>
        </View>

        {/* General Information Card */}
        <View
          className="bg-white rounded-2xl p-6 mb-4"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
        >
          <Text className="text-[11px] font-semibold mb-4 tracking-wider" style={{ color: theme.colors.accent }}>
            GENERAL INFORMATION
          </Text>

          {/* Date */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
              Date
            </Text>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.headingText }}>
              {formatDate(receipt.rcptDate)}
            </Text>
          </View>

          {/* Docket Number */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
              Docket Number
            </Text>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.headingText }}>
              {receipt.docketNo}
            </Text>
          </View>

          {/* Customer */}
          <View className="flex-row justify-between items-start">
            <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
              Customer
            </Text>
            <View className="items-end flex-1 ml-4">
              <Text className="text-sm font-semibold text-right" style={{ color: theme.colors.primary }}>
                {receipt.customer}
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Breakdown Card */}
        <View
          className="bg-white rounded-2xl p-6 mb-4"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
        >
          <Text className="text-[11px] font-semibold mb-4 tracking-wider" style={{ color: theme.colors.accent }}>
            FINANCIAL BREAKDOWN
          </Text>

          {/* Total Amount */}
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold" style={{ color: theme.colors.headingText }}>
              Total Amount
            </Text>
            <Text className="text-lg font-bold" style={{ color: theme.colors.primary }}>
              {money(receipt.totalAmount)}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
