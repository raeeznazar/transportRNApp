import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetOutwardsGetMissingPackets } from "../../../hooks/useApiQueries";
import { useCurrentTheme } from "../../../stores/themeStore";
import BottomButtonContainer from "../../components/ButtomTwoButtonContainer";
import { Button } from "../../components/Button";
export default function OutwardsSummaryPendingPackets({ route }) {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  const { docketId } = route.params || {};

  const {
    data: shortageData,
    isLoading,
    isError,
    error,
  } = useGetOutwardsGetMissingPackets(docketId, {
    enabled: isFocused && !!docketId,
  });
  // Sample short packets data
  const shortPackets = shortageData || [];

  if (error || isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Server error loading data…</Text>
      </View>
    );
  }

  // Handle empty data state
  if (!shortPackets || shortPackets.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="checkmark-circle" size={48} color={theme.colors.successColor} />
        <Text className="mt-2 text-base font-semibold" style={{ color: theme.colors.text }}>
          No Missing Packets
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Loading data…</Text>
      </View>
    );
  }

  const PacketCard = ({ packet }) => (
    <TouchableOpacity
      className="flex-row items-center gap-4 p-4 rounded-lg shadow-sm border"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: "#e2e8f0",
      }}
      activeOpacity={0.7}
    >
      <View
        className="items-center justify-center rounded-lg shrink-0 w-12 h-12"
        style={{
          backgroundColor: "#ef4444" + "15",
        }}
      >
        <Ionicons name="warning" size={24} color="#ef4444" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: theme.colors.text }}>
          {packet?.missingBarcode}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          <View
            className="px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: "#ef4444" + "15",
              borderWidth: 1,
              borderColor: "#ef4444" + "20",
            }}
          >
            <Text className="text-xs font-medium" style={{ color: "#dc2626" }}>
              Short
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Header */}

      {/* Main Content */}
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Info Banner */}
        <View
          className="mb-4 rounded-lg p-4 flex-row items-start gap-3 border"
          style={{
            backgroundColor: theme.colors.primary + "10",
            borderColor: theme.colors.primary + "30",
          }}
        >
          <Ionicons name="information-circle" size={24} color={theme.colors.primary} style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
              Review Required
            </Text>
            <Text className="text-xs" style={{ color: theme.colors.secondaryText }}>
              Please verify the physical absence of these {shortPackets.length} packets before confirming the shortage report.
            </Text>
          </View>
        </View>

        {/* Packet List */}
        <View className="gap-3">
          {shortPackets?.map((packet, index) => (
            <PacketCard key={`${packet?.docketID}+${index}`} packet={packet} />
          ))}
        </View>
      </ScrollView>

      {/* Footer Button */}
      {/* <View
        className="border-t p-4 shadow-lg"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderTopColor: "#e2e8f0" + "40",
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onPress={() => {
            navigation.goBack();
          }}
        >
          Confirm Short List
        </Button>
      </View> */}
      <BottomButtonContainer>
        <Button
          variant="primary"
          size="lg"
          onPress={() => {
            navigation.goBack();
          }}
        >
          Confirm Short List
        </Button>
      </BottomButtonContainer>
    </View>
  );
}
