import { MaterialIcons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetOutwardsSummaryRemainingDockets, useOutwadesDocketsRemovalSubmit } from "../../../hooks/useApiQueries";
import { useCurrentTheme } from "../../../stores/themeStore";
import { Button } from "../../components/Button";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";

const REASON_OPTIONS = [
  { label: "Shortage (Not in Warehouse)", value: "Shortage (Not in Warehouse)" },
  { label: "Damaged Item", value: "Damaged Item" },
  { label: "Wrong Barcode", value: "Wrong Barcode" },
  { label: "Customer Cancellation", value: "Customer Cancellation" },
];

export default function OutwadesDocketsRemoval({ route }) {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { altId } = route.params || {};
  const [packets, setPackets] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkReason, setBulkReason] = useState("");
  const isFocused = useIsFocused();
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const { data, error, isLoading } = useGetOutwardsSummaryRemainingDockets(altId);
  console.log("OutwadesDocketsRemoval Data:", data);
  // Handle loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-2 text-inputText">Loading dockets...</Text>
      </View>
    );
  }
  // Handle error state
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.colors.alertColor} />
        <Text className="mt-2 text-inputText">Error loading dockets</Text>
      </View>
    );
  }
  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MaterialIcons name="inbox" size={48} color={theme.colors.secondaryText} />
        <Text className="mt-2 text-inputText">No dockets to remove</Text>
      </View>
    );
  }
  const removableDocketsRemovalSubmit = useOutwadesDocketsRemovalSubmit();

  // Initialize packets from API data
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const formattedPackets = data.map((item) => ({
        id: item.docketID,
        docketNumber: item.docketNo,
        totalPackets: item.totalPackets,
        plsId: item.plsId,
        plsNo: item.plsNo,
        slNo: item.slNo,
        reason: "",
        selected: false,
      }));
      setPackets(formattedPackets);
    }
    if (!isFocused) {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [data, isFocused]);

  // Calculate selected count
  const selectedCount = packets.filter((p) => p.selected).length;
  const totalCount = packets.length;

  // Toggle individual packet selection
  const togglePacket = (id) => {
    setPackets(packets.map((packet) => (packet.id === id ? { ...packet, selected: !packet.selected } : packet)));
  };

  // Toggle select all
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setPackets(packets.map((packet) => ({ ...packet, selected: newSelectAll })));
  };

  // Update individual packet reason
  const updatePacketReason = (id, reason) => {
    setPackets((prev) => prev.map((p) => (p.id === id ? { ...p, reason } : p)));
  };

  // Apply bulk reason to selected packets
  const applyBulkReason = (reason) => {
    setBulkReason(reason);
    if (reason) {
      setPackets((prev) => prev.map((p) => ({ ...p, reason })));
    }
  };

  // Handle confirm removal
  const handleConfirmRemoval = () => {
    const selectedPackets = packets.filter((p) => p.selected && p.reason);
    const docketsToRemove = selectedPackets.map((packet) => ({
      docketID: packet.id,
      removalReason: packet.reason,
      removeRemarks: packet.reason, // You can add a separate remarks field if needed
    }));

    // Get plsNo and plsId from the first packet (all packets share the same PLS)
    const plsNo = packets.length > 0 ? packets[0].plsNo : null;
    const plsId = packets.length > 0 ? packets[0].plsId : null;

    const removal = {
      plsNo,
      plsId,
      removedUserID: "ADMIN",
      docketsToRemove,
    };
    console.log("docketsToRemove:", removal);

    if (removal) {
      removableDocketsRemovalSubmit.mutate(removal, {
        onSuccess: (response) => {
          setToastConfig({
            visible: true,
            type: "success",
            title: "Success",
            message: response?.status?.message || "Dockets removed successfully",
          });
          navigation.navigate("OutwadesSummaryScreen", { altId });
        },
        onError: (error) => {
          setToastConfig({
            visible: true,
            type: "error",
            title: "Error",
            message: error?.status?.message || "Failed to remove dockets",
          });
          // Handle error, show toast or alert
        },
      });
    }
    // Add your API call here
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      {/* Header Section */}
      <View
        className="px-5 pb-5 border-b"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottomColor: theme.colors.cardBorder,
          paddingTop: insets.top + 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="gap-4">
          {/* Select All Checkbox */}
          <TouchableOpacity className="flex-row items-center gap-3" onPress={handleSelectAll} activeOpacity={0.7}>
            <View
              className="w-5 h-5 rounded items-center justify-center border-2"
              style={{
                borderColor: selectAll ? theme.colors.primary : theme.colors.inputBorder,
                backgroundColor: selectAll ? theme.colors.primary : "transparent",
              }}
            >
              {selectAll && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
            </View>
            <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
              Select All ({totalCount} Packets)
            </Text>
          </TouchableOpacity>

          {/* Bulk Reason Section */}
          <View className="gap-2">
            <Text className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.colors.inputPlaceholder }}>
              BULK REASON ACTION
            </Text>
            <FullWidthSelectInput
              placeholderText="Apply common reason to selected..."
              value={bulkReason}
              onChange={(value) => applyBulkReason(value)}
              items={[{ label: "Apply common reason to selected...", value: "" }, ...REASON_OPTIONS]}
              labelFontSize={14}
            />
          </View>
        </View>
      </View>

      {/* Packets List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        {packets.map((packet) => (
          <PacketCard
            key={packet.id}
            packet={packet}
            theme={theme}
            onToggle={() => togglePacket(packet.id)}
            onReasonChange={(reason) => updatePacketReason(packet.id, reason)}
          />
        ))}
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pt-5 border-t"
        style={{
          backgroundColor: "#FFFFFF",
          borderTopColor: theme.colors.cardBorder,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View className="gap-3 max-w-[512px] w-full self-center">
          <View className="flex-row justify-between items-center px-1">
            <Text className="text-sm font-medium" style={{ color: theme.colors.bodyText }}>
              Items selected:
            </Text>
            <Text className="text-sm font-bold" style={{ color: theme.colors.primary }}>
              {selectedCount} of {totalCount}
            </Text>
          </View>
          <Button
            variant="primary"
            size="lg"
            disabled={selectedCount === 0 || !packets.some((p) => p.selected && p.reason)}
            onPress={handleConfirmRemoval}
          >
            <MaterialIcons name="delete-sweep" size={20} color="#FFFFFF" />
            <Text className="text-white text-base font-bold ml-2">Confirm Removal</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}

// Packet Card Component
function PacketCard({ packet, theme, onToggle, onReasonChange }) {
  return (
    <View
      className="rounded-2xl p-4 border mb-3"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: theme.colors.cardBorder,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Card Header with Checkbox */}
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity className="flex-row items-center gap-3 flex-1" onPress={onToggle} activeOpacity={0.7}>
          <View
            className="w-5 h-5 rounded items-center justify-center border-2"
            style={{
              borderColor: packet.selected ? theme.colors.primary : theme.colors.inputBorder,
              backgroundColor: packet.selected ? theme.colors.primary : "transparent",
            }}
          >
            {packet.selected && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
          </View>
          <View>
            <Text className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: theme.colors.inputPlaceholder }}>
              DOCKET NUMBER
            </Text>
            <Text className="text-base font-bold" style={{ color: theme.colors.headingText }}>
              {packet.docketNumber}
            </Text>
          </View>
        </TouchableOpacity>
        <View className="items-end">
          <Text className="text-[10px] font-bold tracking-widest uppercase mb-0.5" style={{ color: theme.colors.inputPlaceholder }}>
            PACKETS
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {packet.totalPackets}
          </Text>
        </View>
      </View>

      {/* Reason Selector */}
      <FullWidthSelectInput
        placeholderText="Select Reason"
        value={packet.reason}
        onChange={(value) => onReasonChange(value)}
        items={[{ label: "Select Reason", value: "" }, ...REASON_OPTIONS]}
        labelFontSize={14}
      />
    </View>
  );
}
