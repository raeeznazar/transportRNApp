import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export default function FullWidthSelectInput({
  label,
  value,
  onChange,
  items = [],
  className, // if you use a Tailwind/className setup this will apply
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

  useEffect(() => {
    if (autoOpen && items && items.length > 0) {
      setOpen(true);
    }
  }, [autoOpen, items]);

  return (
    <View className={className} style={[styles.wrapper, style]}>
      {label ? (
        <Text
          style={[styles.label, { color: theme.colors.inputText, fontSize: labelFontSize, fontWeight: labelFontWeight, lineHeight: labelLineHeight }]}
        >
          {label}
        </Text>
      ) : null}
      {/* Modal-based picker fallback (pure JS) — safe replacement for native Picker */}
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
            <ScrollView contentContainerStyle={styles.modalList}>
              {items && items.length > 0 ? (
                items.map((it) => (
                  <TouchableOpacity
                    key={String(it.value)}
                    onPress={() => {
                      onChange?.(it.value);
                      setOpen(false);
                    }}
                    style={styles.modalItem}
                  >
                    <Text style={{ color: theme.colors.inputText }}>{it.label}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: theme.colors.inputPlaceholder, padding: 12 }}>No options</Text>
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.modalClose}>
              <Text style={{ color: theme.colors.inputPlaceholder }}>{Platform.OS === "android" ? "CANCEL" : "Done"}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/**
 * FullWidthSelectInput
 * ------------------------------------------------------------
 * Reusable full-width select input using a modal list picker.
 *
 * ✅ What it does
 * - Shows a touchable input-style field
 * - Opens a modal with selectable options
 * - Returns selected value with `onChange(value)`
 * - Supports auto-open when options are loaded
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
 *   Called when user selects an option.
 *
 * - items?: Array<{ label: string, value: string | number }>
 *   Options displayed in modal.
 *
 * - placeholderText?: string
 *   Placeholder text when no value is selected.
 *
 * - autoOpen?: boolean (default: false)
 *   Auto-opens picker modal when items exist.
 *
 * - className?: string
 *   NativeWind classes for wrapper View.
 *
 * - style?: ViewStyle
 *   Extra wrapper style.
 *
 * - labelFontSize?: number (default: 16)
 * - labelFontWeight?: string (default: "400")
 * - labelLineHeight?: number (default: 24)
 *
 * ✅ Notes
 * - If `items` is empty, input tap will not open modal.
 * - If selected `value` is not in `items`, raw `value` is shown.
 *
 * ✅ Example
 * const [ledgerType, setLedgerType] = useState(null);
 *
 * <FullWidthSelectInput
 *   label="Ledger"
 *   placeholderText="Search ledger..."
 *   items={[
 *     { label: "John Doe", value: "1" },
 *     { label: "Jane Smith", value: "2" },
 *   ]}
 *   value={ledgerType}
 *   onChange={setLedgerType}
 *   className="pb-4"
 * />
 */

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
