import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";

export default function DocketMissingPacketsAdd() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { docket } = route.params || {};

  const [selectedPackets, setSelectedPackets] = useState(new Set([1]));
  const [addingPacket, setAddingPacket] = useState(1);
  const [reason, setReason] = useState("");

  // Sample packet data
  const packets = [
    { id: 1, serialNo: "132459874#01", status: "selected" },
    { id: 2, serialNo: "132459874#09", status: "normal" },
    { id: 3, serialNo: "132459874#21", status: "normal" },
    { id: 4, serialNo: "132459874#36", status: "found" },
    { id: 5, serialNo: "132459874#40", status: "normal" },
  ];

  const togglePacket = (packetId) => {
    const newSelected = new Set(selectedPackets);
    if (newSelected.has(packetId)) {
      newSelected.delete(packetId);
    } else {
      newSelected.add(packetId);
    }
    setSelectedPackets(newSelected);
    setAddingPacket(packetId);
  };

  const PacketRow = ({ packet, index }) => {
    const isSelected = selectedPackets.has(packet.id);
    const isFound = packet.status === "found";
    const isEven = index % 2 === 0;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !isFound && togglePacket(packet.id)}
        className="flex-row border-b"
        style={{
          backgroundColor: isFound ? theme.colors.success + "10" : isSelected ? theme.colors.primary + "08" : "transparent",
          borderBottomColor: "#e2e8f0",
        }}
      >
        <View className="w-16 py-4 items-center justify-center">
          <View
            className="w-5 h-5 rounded-full border-2 items-center justify-center"
            style={{
              borderColor: isFound ? theme.colors.success : isSelected ? theme.colors.primary : theme.colors.border,
              backgroundColor: isSelected || isFound ? (isFound ? theme.colors.success : theme.colors.primary) : "transparent",
            }}
          >
            {isSelected && !isFound && <Ionicons name="checkmark" size={12} color="#fff" />}
            {isFound && <Ionicons name="checkmark-done" size={12} color="#fff" />}
          </View>
        </View>
        <View className="flex-1 py-4 px-4 justify-center">
          <Text
            className="font-mono font-medium"
            style={{
              color: isFound ? theme.colors.success : isSelected ? theme.colors.text : theme.colors.text,
            }}
          >
            {packet.serialNo}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View
        className="px-6 py-4 border-b"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderBottomColor: "#e2e8f0",
        }}
      >
        <View
          className="p-4 rounded-xl border items-center"
          style={{
            backgroundColor: theme.colors.primary + "10",
            borderColor: theme.colors.primary + "20",
          }}
        >
          <Text className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: theme.colors.primary, letterSpacing: 1.2 }}>
            Docket No
          </Text>
          <Text className="text-2xl font-mono font-bold tracking-tight" style={{ color: theme.colors.primary }}>
            {docket?.number || "132459874"}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 p-4">
        <Text className="text-sm text-center px-2 mb-6" style={{ color: theme.colors.secondaryText }}>
          Select the missing packets from the list below to mark them.
        </Text>

        {/* Table */}
        <View className="rounded-xl overflow-hidden border  mb-6" style={{ borderColor: "#e2e8f0" }}>
          {/* Table Header */}
          <View className="flex-row" style={{ backgroundColor: theme.colors.primary }}>
            <View className="w-16 py-3 items-center justify-center border-r" style={{ borderRightColor: "rgba(255,255,255,0.2)" }}>
              <Text className="text-white text-xs font-semibold uppercase tracking-wider">Select</Text>
            </View>
            <View className="flex-1 py-3 px-4 justify-center">
              <Text className="text-white text-xs font-semibold uppercase tracking-wider">Packet Serial No</Text>
            </View>
          </View>

          {/* Table Rows */}
          {packets.map((packet, index) => (
            <PacketRow key={packet.id} packet={packet} index={index} />
          ))}
        </View>

        {/* Adding Packet Card */}
        {addingPacket && selectedPackets.has(addingPacket) && (
          <View
            className="rounded-xl shadow-lg border overflow-hidden mb-6"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderColor: theme.colors.success + "30",
            }}
          >
            <View
              className="px-4 py-2 border-b flex-row justify-between items-center"
              style={{
                backgroundColor: theme.colors.success + "10",
                borderBottomColor: theme.colors.success + "20",
              }}
            >
              <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.colors.success }}>
                Adding: {packets.find((p) => p.id === addingPacket)?.serialNo}
              </Text>
              <TouchableOpacity onPress={() => setAddingPacket(null)}>
                <Ionicons name="close" size={18} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              <Text className="text-sm font-medium mb-2" style={{ color: theme.colors.text }}>
                Reason
              </Text>
              <TextInput
                className="p-3 text-base rounded-lg"
                style={{
                  backgroundColor: theme.colors.background,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  color: theme.colors.text,
                }}
                placeholder="Type the reason here..."
                placeholderTextColor={theme.colors.secondaryText + "80"}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={reason}
                onChangeText={setReason}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View
        className="p-4 border-t"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderTopColor: "#e2e8f0" + "30",
          paddingBottom: insets.bottom,
        }}
      >
        <Button variant="primary" size="lg" onPress={() => {}}>
          Add Missing Packet
        </Button>
      </View>
    </View>
  );
}
