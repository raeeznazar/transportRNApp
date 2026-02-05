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
  labelFontSize = 16,
  labelFontWeight = "500",
  labelLineHeight = 24,
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
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
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
