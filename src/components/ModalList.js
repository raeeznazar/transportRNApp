import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

/* ─────────────────────────────────────────────────────────────
   ModalList — reusable modal picker with optional search

   Props
   ─────
   visible        boolean                    – controls modal open/close
   onClose        () => void                 – called when modal is dismissed
   onSelect       (item: object) => void     – called with the full item object

   items          object[]                   – array of data objects
   labelKey       string  (default "label")  – key used for the display text
   valueKey       string  (default "value")  – key used to match selectedValue

   selectedValue  any                        – currently selected value (for highlighting)
   title          string                     – modal header title
   searchable     boolean (default true)     – show / hide the search input
   searchPlaceholder string                  – placeholder for the search box
   emptyText      string                     – shown when list / search returns nothing
   ───────────────────────────────────────────────────────────── */
const ModalList = ({
  visible = false,
  onClose,
  onSelect,
  items = [],
  labelKey = "label",
  valueKey = "value",
  selectedValue,
  title = "Select an option",
  searchable = true,
  searchPlaceholder = "Search...",
  emptyText = "No results found",
}) => {
  const theme = useCurrentTheme();
  const styles = makeStyles(theme);

  const [query, setQuery] = useState("");
  const [placeHolder, setPlaceHolder] = useState("Search...");

  // Reset search when modal closes
  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const lower = query.toLowerCase();
    return items.filter((item) =>
      String(item[labelKey] ?? item[valueKey] ?? "")
        .toLowerCase()
        .includes(lower)
    );
  }, [items, query, labelKey, valueKey]);

  const handleSelect = (item) => {
    onSelect?.(item);
    onClose?.();
  };

  const renderItem = ({ item, index }) => {
    const label = item[labelKey] ?? item[valueKey] ?? "";
    const isSelected = item[valueKey] === selectedValue;

    return (
      <TouchableOpacity
        key={`${String(item[valueKey])}-${index}`}
        onPress={() => handleSelect(item)}
        style={[styles.item, isSelected && styles.itemSelected]}
        activeOpacity={0.7}
      >
        <Text style={[styles.itemText, isSelected && styles.itemTextSelected]} numberOfLines={1}>
          {String(label)}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={18} color={theme.colors.buttonPrimaryBg} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Inner Pressable stops tap-through from closing when tapping content */}
        <Pressable style={[styles.sheet, { backgroundColor: theme.colors.inputBg }]} onPress={() => {}}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.headingText }]}>{title}</Text>
          </View>

          {/* ── Optional Search ── */}
          {searchable && (
            <View style={[styles.searchWrapper, { borderColor: theme.colors.inputBorder }]}>
              <Ionicons name="search-outline" size={18} color={theme.colors.inputPlaceholder} style={styles.searchIcon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.inputPlaceholder}
                style={[styles.searchInput, { color: theme.colors.inputText }]}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                underlineColorAndroid="transparent"
                // iOS: remove default padding so height stays consistent
                padding={0}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={17} color={theme.colors.inputPlaceholder} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ── List ── */}
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${String(item[valueKey] ?? index)}-${index}`}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews={Platform.OS === "android"}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.inputPlaceholder }]}>{emptyText}</Text>}
          />
          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text style={{ color: theme.colors.inputPlaceholder }}>{Platform.OS === "android" ? "CANCEL" : "Done"}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default React.memo(ModalList);

/* ─────────────────────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────────────────────── */
const makeStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },

    sheet: {
      width: "100%",
      maxWidth: 520,
      maxHeight: "80%",
      borderRadius: 16,
      overflow: "hidden",
    },

    /* Header */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.inputBorder,
    },

    title: {
      fontSize: 16,
      fontWeight: "600",
      flex: 1,
      marginRight: 8,
    },

    /* Search */
    searchWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      marginHorizontal: 14,
      marginVertical: 12,
      paddingHorizontal: 10,
      height: 44,
    },

    searchIcon: {
      marginRight: 8,
    },

    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Figtree-Regular",
      // Android: clear internal padding
      margin: 0,
      includeFontPadding: false,
      textAlignVertical: "center",
    },

    /* List */
    listContent: {
      paddingBottom: 12,
    },

    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.inputBorder,
    },

    itemSelected: {
      backgroundColor: `${theme.colors.buttonPrimaryBg}12`, // ~7% opacity tint
    },

    itemText: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.inputText,
      fontFamily: "Figtree-Regular",
      marginRight: 8,
    },

    itemTextSelected: {
      color: theme.colors.buttonPrimaryBg,
      fontFamily: "Figtree-SemiBold",
    },

    emptyText: {
      padding: 16,
      fontSize: 14,
      fontFamily: "Figtree-Regular",
    },
    modalClose: {
      padding: 12,
      alignItems: "flex-end",
    },
  });

//   Usage

// import ModalList from "@/src/components/ModalList";

// // Standard { value, label } items
// const [open, setOpen] = useState(false);
// const [selected, setSelected] = useState(null);

// <ModalList
//   visible={open}
//   onClose={() => setOpen(false)}
//   onSelect={(item) => setSelected(item.value)}
//   items={[{ value: 1, label: "Customer A" }, { value: 2, label: "Customer B" }]}
//   selectedValue={selected}
//   title="Select Customer"
// />

// // Custom key shape — { id, name }  +  no search
// <ModalList
//   visible={open}
//   onClose={() => setOpen(false)}
//   onSelect={(item) => setSelected(item.id)}
//   items={[{ id: "D001", name: "Docket 001" }, { id: "D002", name: "Docket 002" }]}
//   labelKey="name"
//   valueKey="id"
//   selectedValue={selected}
//   title="Select Docket"
//   searchable={false}
// />
