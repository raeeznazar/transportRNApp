import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

/* ---------------- COMPONENT ---------------- */
/**
 * SearchFilter
 *
 * Props:
 *  value            – controlled text value
 *  onChangeText     – (text: string) => void
 *  placeholder      – input placeholder  (default: "Search by Docket, Customer...")
 *  onFilterPress    – () => void  called when filter button is tapped
 *  showFilterButton – boolean  (default: true)  toggle filter button visibility
 *  autoFocus        – boolean  (default: false)
 *  containerStyle   – extra style for the outer row wrapper
 *  inputStyle       – extra style for the TextInput
 *  filterBtnStyle   – extra style for the filter button
 */
const SearchFilter = ({
  value,
  onChangeText,
  placeholder = "Search by Docket, Customer...",
  onFilterPress,
  showFilterButton = true,
  autoFocus = false,
  containerStyle,
  inputStyle,
  filterBtnStyle,
  ...props
}) => {
  const theme = useCurrentTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.row, containerStyle]}>
      {/* ── Search Input ── */}
      <View style={styles.inputWrapper}>
        <Ionicons name="search-outline" size={20} color={theme.colors.inputPlaceholder} style={styles.searchIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inputPlaceholder}
          style={[styles.input, inputStyle]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          autoFocus={autoFocus}
          underlineColorAndroid="transparent"
          {...props}
        />
        {/* Clear button */}
        {value?.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText?.("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={theme.colors.inputPlaceholder} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter Button ── */}
      {showFilterButton && (
        <TouchableOpacity onPress={onFilterPress} activeOpacity={0.8} style={[styles.filterBtn, filterBtnStyle]}>
          <Ionicons name="options-outline" size={22} color={theme.colors.buttonPrimaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(SearchFilter);

/* ---------------- STYLES ---------------- */
const INPUT_HEIGHT = 50;
const FILTER_SIZE = 50;

const makeStyles = (theme) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      gap: 10,
    },

    /* Search input container */
    inputWrapper: {
      flex: 1,
      height: INPUT_HEIGHT,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 12,
    },

    searchIcon: {
      marginRight: 8,
    },

    input: {
      flex: 1,
      height: INPUT_HEIGHT,
      fontSize: 15,
      color: theme.colors.inputText,
      fontFamily: "Figtree-Regular",
      // Android fix: remove default padding/margin
      padding: 0,
      margin: 0,
      includeFontPadding: false,
      textAlignVertical: "center",
    },

    clearBtn: {
      marginLeft: 6,
    },

    /* Filter button */
    filterBtn: {
      width: FILTER_SIZE,
      height: FILTER_SIZE,
      borderRadius: 14,
      backgroundColor: theme.colors.buttonPrimaryBg,
      alignItems: "center",
      justifyContent: "center",
    },
  });

// const [query, setQuery] = React.useState("");

// <SearchFilter
//   value={query}
//   onChangeText={setQuery}
//   onFilterPress={() => console.log("open filter sheet")}
// />

// // Custom placeholder, no filter button
{
  /* <SearchFilter
  value={query}
  onChangeText={setQuery}
  placeholder="Search dockets..."
  showFilterButton={false}
/> */
}
