import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";

// Move BarcodeInput outside the main component
const BarcodeInput = React.memo(({ barcodeObj, index, isActive, onChangeText, onRemove, onFocus, theme }) => (
  <View
    className="flex-row rounded-lg shadow-sm overflow-hidden"
    style={{
      borderWidth: isActive ? 2 : 1,
      borderColor: "#e2e8f0",
      backgroundColor: theme.colors.cardBg,
      ...(isActive && {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }),
    }}
  >
    <TextInput
      className="flex-1 px-4 py-4 text-base font-medium"
      style={{
        color: theme.colors.text,
        borderRightWidth: 1,
        borderRightColor: "#e2e8f0",
      }}
      placeholder="Enter barcode number"
      placeholderTextColor={theme.colors.secondaryText}
      inputMode="numeric"
      value={barcodeObj.barcode}
      onChangeText={(value) => onChangeText(index, value)}
      onFocus={() => onFocus(index)}
      editable={true}
    />
    <TouchableOpacity
      className="px-4 items-center justify-center"
      onPress={() => onRemove(index)}
      style={{
        backgroundColor: isActive ? theme.colors.primary + "10" : "transparent",
      }}
    >
      <Ionicons
        name="trash"
        size={24}
        color={theme.colors.secondaryText}
        style={{
          opacity: isActive ? 1 : 0.6,
        }}
      />
    </TouchableOpacity>
  </View>
));

export default function DocketAddExtra() {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [barcodes, setBarcodes] = useState([{ barcode: "", remarks: "Extra Added" }]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const addBarcode = useCallback(() => {
    setBarcodes((prev) => [...prev, { barcode: "", remarks: "Extra Added" }]);
    setTimeout(() => setFocusedIndex(barcodes.length), 0);
  }, [barcodes.length]);

  const removeBarcode = useCallback((index) => {
    setBarcodes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateBarcode = useCallback((index, value) => {
    setBarcodes((prev) => {
      const newBarcodes = [...prev];
      newBarcodes[index] = { ...newBarcodes[index], barcode: value };
      return newBarcodes;
    });
  }, []);

  const handleFocus = useCallback((index) => {
    setFocusedIndex(index);
  }, []);
  const submitBarcodes = useCallback(() => {
    console.log("Submitted Barcodes:", barcodes);
  }, [barcodes]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      {/* Header */}

      {/* Scrollable Content */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Headline & Description */}
        <View className="px-5 pt-2 pb-6">
          <Text className="text-2xl font-bold mb-2 tracking-tight" style={{ color: theme.colors.text }}>
            Enter Docket Barcodes
          </Text>
          <Text className="text-base" style={{ color: theme.colors.secondaryText }}>
            Type in the barcode numbers manually if the scanner is not working.
          </Text>
        </View>

        {/* Input List */}
        <View className="flex gap-4 px-5 pb-40">
          {barcodes.map((barcodeObj, index) => (
            <BarcodeInput
              key={`barcode-${index}`}
              barcodeObj={barcodeObj}
              index={index}
              isActive={index === focusedIndex}
              onChangeText={updateBarcode}
              onRemove={removeBarcode}
              onFocus={handleFocus}
              theme={theme}
            />
          ))}

          {/* Add New Button */}
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 rounded-lg mt-2 border-2"
            style={{
              borderColor: "#e2e8f0" + "40",
              backgroundColor: theme.colors.primary + "10",
            }}
            onPress={addBarcode}
          >
            <Ionicons name="add" size={24} color={theme.colors.primary} />
            <Text className="font-bold text-base ml-2" style={{ color: theme.colors.primary }}>
              Add Another Barcode
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 p-4 border-t"
        style={{
          backgroundColor: theme.colors.cardBg + "E8",
          borderTopColor: "#e2e8f0" + "40",
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View className="mb-3 px-1 flex-row justify-between">
          <Text className="text-sm font-medium" style={{ color: theme.colors.secondaryText }}>
            Total Items
          </Text>
          <Text className="text-sm font-medium" style={{ color: theme.colors.secondaryText }}>
            {barcodes.length} Entries
          </Text>
        </View>
        <Button variant="primary" size="lg" onPress={submitBarcodes}>
          Submit Entries
        </Button>
      </View>
    </View>
  );
}
