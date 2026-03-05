import { useEffect, useState } from "react";
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export default function FullWidthSearchSelectInput({
  label,
  value,
  onChange,
  items = [],
  className,
  style,
  placeholderText,
  autoOpen = false,
  labelFontSize = 12,
  labelFontWeight = "500",
  labelLineHeight = 18,
  ...rest
}) {
  const theme = useCurrentTheme();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (autoOpen && items && items.length > 0) {
      setOpen(true);
    }
  }, [autoOpen, items]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const filteredItems = items.filter((it) => it.label.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      key={`${String(item.value)}-${index}`}
      onPress={() => {
        onChange?.(item.value);
        setOpen(false);
        setSearchQuery("");
      }}
      style={styles.modalItem}
    >
      <Text style={{ color: theme.colors.inputText }}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className={className} style={[styles.wrapper, style]}>
      {label ? (
        <Text
          style={[styles.label, { color: theme.colors.inputText, fontSize: labelFontSize, fontWeight: labelFontWeight, lineHeight: labelLineHeight }]}
        >
          {label}
        </Text>
      ) : null}
      <View style={[styles.pickerWrap, { borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.inputBg }]} className="rounded-xl">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (items && items.length > 0) setOpen(true);
          }}
          style={styles.inputButton}
        >
          <Text
            style={[styles.inputText, { color: value ? theme.colors.inputText : theme.colors.inputPlaceholder }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {(() => {
              if (value) {
                const found = items.find((it) => it.value === value);
                return found ? found.label : String(value);
              }
              return placeholderText ?? `Select ${label ?? "option"}`;
            })()}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.inputBg }]} onPress={() => {}}>
            <Text style={[styles.modalTitle, { color: theme.colors.bodyText }]}>{label ?? "Select an option"}</Text>
            <TextInput
              style={[styles.searchInput, { borderColor: theme.colors.inputBorder, color: theme.colors.inputText }]}
              placeholder="Search..."
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={(item, index) => `${String(item.value)}-${index}`}
              contentContainerStyle={styles.modalList}
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              removeClippedSubviews={true}
              ListEmptyComponent={
                <Text style={{ color: theme.colors.inputPlaceholder, padding: 12 }}>{searchQuery ? "No results found" : "No options"}</Text>
              }
            />
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.modalClose}>
              <Text style={{ color: theme.colors.inputPlaceholder }}>{Platform.OS === "android" ? "CANCEL" : "Done"}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 0,
  },
  label: {
    marginBottom: 6,
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    minHeight: 44,
    justifyContent: "center",
  },
  inputButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 14,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    margin: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 520,
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
  },
  modalList: {
    paddingVertical: 8,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  modalClose: {
    padding: 12,
    alignItems: "flex-end",
  },
});

/**
 * FullWidthSearchSelectInput
 * ------------------------------------------------------------
 * Reusable full-width searchable select input with modal picker.
 *
 * ✅ What it does
 * - Shows a touchable input field
 * - Opens modal with search box + list of options
 * - Filters options by typed search text
 * - Returns selected value via `onChange(value)`
 *
 * ✅ Expected `items` format
 * [
 *   { label: "John Doe", value: "1" },
 *   { label: "Jane Smith", value: "2" }
 * ]
 *
 * ✅ Props
 * - label?: string
 *   Label shown above the input.
 *
 * - value?: string | number
 *   Currently selected value.
 *
 * - onChange?: (value) => void
 *   Called when user selects an item.
 *
 * - items?: Array<{label: string, value: string | number}>
 *   Options to display in modal.
 *
 * - placeholderText?: string
 *   Placeholder when no value is selected.
 *
 * - autoOpen?: boolean (default: false)
 *   Opens modal automatically when items are available.
 *
 * - className?: string
 *   NativeWind classes for wrapper View.
 *
 * - style?: ViewStyle
 *   Extra inline style for wrapper View.
 *
 * - labelFontSize?: number (default: 12)
 * - labelFontWeight?: string (default: "500")
 * - labelLineHeight?: number (default: 18)
 *
 * ✅ Notes
 * - If `items` is empty, tapping input will not open modal.
 * - Search is case-insensitive.
 * - On modal close, search text resets.
 *
 * ✅ Example
 * const [customerId, setCustomerId] = useState(null);
 *
 * <FullWidthSearchSelectInput
 *   label="Customer"
 *   value={customerId}
 *   onChange={setCustomerId}
 *   placeholderText="Search customer..."
 *   items={[
 *     { label: "John Doe", value: "1" },
 *     { label: "Jane Smith", value: "2" },
 *   ]}
 *   className="mb-3"
 * />
 */
