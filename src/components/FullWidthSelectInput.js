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
      {label ? <Text style={[styles.label, { color: theme.colors.bodyText }]}>{label}</Text> : null}
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
  },
  pickerWrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 56,
    justifyContent: "center",
  },
  inputButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
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
