import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../../stores/themeStore";
import { Button } from "../../components/Button";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";

// Demo data
const DEMO_PACKETS = [
  { id: 1, docketNumber: "PKT-90234851", weight: "12.5", reason: "Shortage (Not in Warehouse)", selected: true },
  { id: 2, docketNumber: "PKT-90234852", weight: "10.0", reason: "", selected: false },
  { id: 3, docketNumber: "PKT-90234855", weight: "15.2", reason: "Damaged Item", selected: true },
  { id: 4, docketNumber: "PKT-90234860", weight: "8.5", reason: "", selected: false },
  { id: 5, docketNumber: "PKT-90234862", weight: "20.3", reason: "", selected: false },
  { id: 6, docketNumber: "PKT-90234865", weight: "7.8", reason: "", selected: false },
  { id: 7, docketNumber: "PKT-90234870", weight: "13.2", reason: "", selected: false },
  { id: 8, docketNumber: "PKT-90234875", weight: "9.5", reason: "", selected: false },
  { id: 9, docketNumber: "PKT-90234880", weight: "11.0", reason: "", selected: false },
  { id: 10, docketNumber: "PKT-90234885", weight: "14.5", reason: "", selected: false },
  { id: 11, docketNumber: "PKT-90234890", weight: "16.8", reason: "", selected: false },
  { id: 12, docketNumber: "PKT-90234895", weight: "12.0", reason: "", selected: false },
];

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

  const [packets, setPackets] = useState(DEMO_PACKETS);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkReason, setBulkReason] = useState("");

  // Calculate selected count
  const selectedCount = packets.filter((p) => p.selected).length;
  const totalCount = packets.length;

  // Toggle individual packet selection
  const togglePacket = (id) => {
    setPackets((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)));
  };

  // Toggle select all
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setPackets((prev) => prev.map((p) => ({ ...p, selected: newSelectAll })));
  };

  // Update individual packet reason
  const updatePacketReason = (id, reason) => {
    setPackets((prev) => prev.map((p) => (p.id === id ? { ...p, reason } : p)));
  };

  // Apply bulk reason to selected packets
  const applyBulkReason = (reason) => {
    setBulkReason(reason);
    if (reason) {
      setPackets((prev) => prev.map((p) => (p.selected ? { ...p, reason } : p)));
    }
  };

  // Handle confirm removal
  const handleConfirmRemoval = () => {
    const selectedPackets = packets.filter((p) => p.selected);
    console.log("Removing packets:", selectedPackets);
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
          <Button variant="primary" size="lg" disabled={selectedCount === 0} onPress={handleConfirmRemoval}>
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
            WEIGHT
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {packet.weight} kg
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
