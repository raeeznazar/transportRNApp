import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation, useRoute } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetOutwardsGetMissingPackets, useOutwadesSubmitAddMissingPackets } from "../../../hooks/useApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import { Button } from "../../components/Button";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import { ScanToast } from "../../components/ScanToast";

const REASON_OPTIONS = [
  { label: "Not found", value: "Not found" },
  { label: "Barcode not reading", value: "Barcode not reading" },
  { label: "No barcode", value: "No barcode" },
];

const PacketRow = React.memo(
  ({ packet, hasReason, isEditing, currentReason, theme, onToggle, onSaveReason, onCancelReason, onChangeReason, savedReason }) => {
    const isSelected = hasReason || isEditing;

    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onToggle}
          className="flex-row border-b"
          style={{
            backgroundColor: isSelected ? theme.colors.primary + "08" : "transparent",
            borderBottomColor: "#e2e8f0",
          }}
        >
          <View className="w-16 py-4 items-center justify-center">
            <View
              className="w-5 h-5 rounded-full border-2 items-center justify-center"
              style={{
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                backgroundColor: isSelected ? theme.colors.primary : "transparent",
              }}
            >
              {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
          </View>
          <View className="flex-1 py-4 px-4 justify-center">
            <Text
              className="font-mono font-medium"
              style={{
                color: theme.colors.text,
              }}
            >
              {packet.missingBarcode}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Reason Select Box - Show when editing */}
        {isEditing && (
          <View
            className="px-4 py-3 border-b"
            style={{
              backgroundColor: theme.colors.primary + "05",
              borderBottomColor: "#e2e8f0",
            }}
          >
            <Text className="text-xs font-medium mb-2" style={{ color: theme.colors.text }}>
              Reason for {packet.missingBarcode}
            </Text>

            {/* Select Input */}
            <FullWidthSelectInput
              label=""
              value={currentReason}
              onChange={onChangeReason}
              items={REASON_OPTIONS}
              placeholderText="Select a reason..."
              className="mb-2"
            />

            {/* Save and Cancel Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onSaveReason}
                disabled={!currentReason}
                className="flex-1 py-2 rounded-lg items-center"
                style={{
                  backgroundColor: currentReason ? theme.colors.success : theme.colors.success + "60",
                }}
              >
                <Text className="text-white text-sm font-semibold">Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onCancelReason}
                className="flex-1 py-2 rounded-lg items-center"
                style={{ backgroundColor: theme.colors.danger }}
              >
                <Text className="text-white text-sm font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Show saved reason */}
        {hasReason && !isEditing && savedReason && (
          <View
            className="px-4 py-2 border-b"
            style={{
              backgroundColor: theme.colors.success + "10",
              borderBottomColor: "#e2e8f0",
            }}
          >
            <Text className="text-xs font-medium mb-1" style={{ color: theme.colors.success }}>
              Reason:
            </Text>
            <Text className="text-sm" style={{ color: theme.colors.text }}>
              {savedReason}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

export default function OutWadesAddShortList() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionData } = useAuthStore();
  const { docketID, altId } = route.params || {};
  const isFocused = useIsFocused();
  const isDirect = route.params?.isDirect || false;

  // Only fetch when screen is focused
  const {
    data: shortageData,
    isLoading,
    isError,
    error,
  } = useGetOutwardsGetMissingPackets(docketID, {
    enabled: isFocused && !!docketID,
  });

  console.log("Fetched shortage data:", shortageData);

  const submitMissingPackets = useOutwadesSubmitAddMissingPackets();
  const { isLoading: isSubmitting } = submitMissingPackets;

  const [packetsWithReasons, setPacketsWithReasons] = useState([]);
  const [currentEditingPacket, setCurrentEditingPacket] = useState(null);
  const [currentReason, setCurrentReason] = useState("");
  const [resultDetails, setResultDetails] = useState(null);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!isFocused) {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [isFocused]);

  // Sample packet data
  const packets = shortageData || [];
  const togglePacket = useCallback(
    (barcode) => {
      // Check if packet already has a reason
      setPacketsWithReasons((prev) => {
        const existingPacket = prev.find((p) => p.serialNumber === barcode);

        if (existingPacket) {
          // Remove packet and its reason
          setCurrentEditingPacket((current) => (current === barcode ? null : current));
          setCurrentReason("");
          return prev.filter((p) => p.serialNumber !== barcode);
        }
        return prev;
      });

      setCurrentEditingPacket((current) => {
        const existingPacket = packetsWithReasons.find((p) => p.serialNumber === barcode);

        if (existingPacket) {
          return current;
        }

        // Check if another packet is being edited
        if (current && current !== barcode) {
          setToastConfig({
            visible: true,
            type: "error",
            title: "Reason Required",
            message: `Please add reason for packet ${current}`,
          });
          return current;
        }

        // Start editing this packet
        setCurrentReason("");
        return barcode;
      });
    },
    [packetsWithReasons]
  );

  const saveReason = useCallback(
    (barcode) => {
      if (!currentReason || currentReason.trim() === "") {
        setToastConfig({
          visible: true,
          type: "error",
          title: "Reason Required",
          message: `Please select a reason for packet ${barcode}`,
        });
        return;
      }

      // Add packet with reason
      setPacketsWithReasons((prev) => [...prev, { serialNumber: barcode, reason: currentReason.trim() }]);
      setCurrentEditingPacket(null);
      setCurrentReason("");

      setToastConfig({
        visible: true,
        type: "success",
        title: "Reason Added",
        message: `Reason saved for packet ${barcode}`,
      });
    },
    [currentReason]
  );

  const handleSubmit = useCallback(() => {
    // Check if there's an unsaved packet being edited
    if (currentEditingPacket) {
      setToastConfig({
        visible: true,
        type: "error",
        title: "Unsaved Reason",
        message: `Please save or cancel the reason for packet ${currentEditingPacket}`,
      });
      return;
    }

    // Validate packets with reasons
    if (packetsWithReasons.length === 0) {
      setToastConfig({
        visible: true,
        type: "error",
        title: "No Packets Selected",
        message: "Please select at least one packet with a reason",
      });
      return;
    }

    // Build the payload in the format your API expects
    const payload = {
      isDirect: isDirect,
      branchCode: sessionData?.branchCode,
      entryUser: sessionData?.userId,
      entryDate: new Date().toISOString(),
      scanningData: packetsWithReasons.map((packet) => ({
        barcode: packet.serialNumber,
        alT_ID: altId,
        remarks: packet.reason,
      })),
    };
    console.log("Submitting missing packets payload:", payload);
    // Call the mutation
    submitMissingPackets.mutate(payload, {
      onSuccess: (response) => {
        // Show result modal with API response
        setResultDetails(response.dataValue);
      },
      onError: (error) => {
        setToastConfig({
          visible: true,
          type: "error",
          title: "Submission Failed",
          message: error?.message || "Failed to save damage record. Please try again.",
        });
      },
    });
  }, [packetsWithReasons, sessionData?.branchCode, currentEditingPacket, submitMissingPackets, navigation]);

  const handleCancelReason = useCallback(() => {
    setCurrentEditingPacket(null);
    setCurrentReason("");
  }, []);

  const closeResultModal = useCallback(() => {
    setResultDetails(null);
    navigation.goBack();
  }, [navigation]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.appBg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Custom Scan Toast */}
      <ScanToast
        visible={toastConfig.visible}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
        onHide={() => setToastConfig({ ...toastConfig, visible: false })}
      />

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
            {packets[0]?.docketNo || "Docket number"}
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 justify-center items-center p-6">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-base font-medium mt-4" style={{ color: theme.colors.text }}>
            Loading packets...
          </Text>
        </View>
      )}

      {/* No Data State */}
      {!isLoading && packets.length === 0 && (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: theme.colors.primary + "10" }}>
            <Ionicons name="document-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text className="text-lg font-bold mb-2" style={{ color: theme.colors.text }}>
            No Packets Found
          </Text>
          <Text className="text-sm text-center" style={{ color: theme.colors.secondaryText }}>
            There are no packets available for this docket.
          </Text>
        </View>
      )}

      {/* Main Content - Only show when data is loaded and available */}
      {!isLoading && packets.length > 0 && (
        <KeyboardAwareScrollView
          className="flex-1 p-4"
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={250}
          enableAutomaticScroll={true}
          showsVerticalScrollIndicator={false}
          enableResetScrollToCoords={false}
        >
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
            {packets.map((packet) => {
              const hasReason = packetsWithReasons.some((p) => p.serialNumber === packet.missingBarcode);
              const isEditing = currentEditingPacket === packet.missingBarcode;
              const savedReason = packetsWithReasons.find((p) => p.serialNumber === packet.missingBarcode)?.reason;

              return (
                <PacketRow
                  key={packet.missingBarcode}
                  packet={packet}
                  hasReason={hasReason}
                  isEditing={isEditing}
                  currentReason={currentReason}
                  theme={theme}
                  onToggle={() => togglePacket(packet.missingBarcode)}
                  onSaveReason={() => saveReason(packet.missingBarcode)}
                  onCancelReason={handleCancelReason}
                  onChangeReason={setCurrentReason}
                  savedReason={savedReason}
                />
              );
            })}
          </View>
        </KeyboardAwareScrollView>
      )}
      {/* Bottom Button */}
      <View
        className="p-4 border-t"
        style={{
          backgroundColor: theme.colors.cardBg,
          borderTopColor: "#e2e8f0" + "30",
          paddingBottom: insets.bottom,
        }}
      >
        <Button variant="primary" size="lg" onPress={handleSubmit}>
          {isSubmitting ? "Submitting..." : `Add Missing Packets (${packetsWithReasons.length})`}
        </Button>
      </View>

      {/* Result Modal */}
      <Modal visible={!!resultDetails} transparent animationType="fade" onRequestClose={closeResultModal}>
        <BlurView intensity={90} tint="dark" style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View
            className="mx-6 rounded-2xl p-6 w-[90%]"
            style={{
              backgroundColor: theme.colors.cardBg,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              maxHeight: "80%",
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: theme.colors.success + "20" }}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                </View>
                <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
                  Submission Result
                </Text>
              </View>
            </View>

            {/* Details List */}
            <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.text }}>
              Results ({resultDetails?.details?.length || 0} items)
            </Text>
            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {resultDetails?.details?.map((item, index) => (
                <View
                  key={`${item.barcode}-${index}`}
                  className="py-2 px-3 mb-2 rounded-lg border flex-row items-center gap-2"
                  style={{
                    backgroundColor: item.status === "SUCCESS" ? theme.colors.success + "05" : theme.colors.danger + "05",
                    borderColor: item.status === "SUCCESS" ? theme.colors.success + "20" : theme.colors.danger + "20",
                  }}
                >
                  {/* Success/Error Icon */}
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: item?.status === "SUCCESS" ? theme.colors.success : theme.colors.danger,
                    }}
                  >
                    <Ionicons name={item?.status === "SUCCESS" ? "checkmark" : "close"} size={14} color="#fff" />
                  </View>

                  {/* Barcode and Message */}
                  <Text className="flex-1 font-mono text-sm" style={{ color: theme.colors.text }}>
                    <Text className="font-semibold">{item?.barcode}</Text>
                    <Text style={{ color: theme.colors.secondaryText }}>
                      {" "}
                      - {item?.status} - {item?.message}
                    </Text>
                  </Text>
                </View>
              ))}
            </ScrollView>
            {/* Done Button */}
            <Button variant="primary" size="lg" onPress={closeResultModal} className="mt-4">
              Done
            </Button>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}
