import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetShortagePacketList } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";
export default function DockectShowPendingPackets({ route }) {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { sessionData } = useAuthStore();
  const { docketId, thcid } = route.params || {};

  const { data: shortageData, isLoading, isError, error } = useGetShortagePacketList(thcid, sessionData?.branchCode, docketId);
  // Sample short packets data
  const shortPackets = shortageData || [];

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
          {packet?.barcode}
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
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
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
            <PacketCard key={packet?.id || packet?.barcode || `packet-${index}`} packet={packet} />
          ))}
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View
        className="border-t p-4 shadow-lg"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderTopColor: "#e2e8f0" + "40",
          paddingBottom: insets.bottom,
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
      </View>
    </View>
  );
}
