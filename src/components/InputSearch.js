import React, { useMemo, useState } from "react";
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useThemeStore } from "../../stores/themeStore";

/**
 * InputSearch
 * Reusable themed search input with optional clear (cross) icon.
 *
 * How to use:
 * <InputSearch
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="Search by truck number..."
 * />
 *
 * Optional props:
 * - showClearButton: show/hide cross icon (default: true)
 * - onClear: callback fired when cross icon is pressed
 * - onSearchPress: callback fired on keyboard search/submit
 * - containerClassName / inputClassName: NativeWind class names
 */
const InputSearch = ({
  value,
  onChangeText,
  placeholder = "Search",
  style,
  inputStyle,
  iconSize = 18,
  iconColor,
  showClearButton = true,
  onClear,
  onSearchPress,
  containerClassName,
  inputClassName,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const { colors } = theme;
  const [isFocused, setIsFocused] = useState(false);

  const styles = useMemo(() => makeStyles(colors), [colors]);
  const resolvedIconColor = iconColor || colors.inputPlaceholder;
  const hasValue = !!String(value ?? "").length;

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }
    if (onChangeText) {
      onChangeText("");
    }
  };

  return (
    <View className={containerClassName} style={[styles.container, isFocused && styles.containerFocused, style]}>
      <Ionicons name="search" size={iconSize} color={resolvedIconColor} style={styles.icon} />

      <TextInput
        className={inputClassName}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        style={[styles.input, inputStyle]}
        returnKeyType="search"
        clearButtonMode="while-editing"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmitEditing={() => onSearchPress?.(value)}
        selectionColor={colors.primary}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />

      {showClearButton && hasValue ? (
        <TouchableOpacity className="ml-2 active:opacity-60" onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={22} color={colors.inputPlaceholder} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default React.memo(InputSearch);

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      height: 44,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBg,
      marginTop: 0,
      marginBottom: 0,
    },

    containerFocused: {
      borderColor: colors.primary,
    },

    icon: {
      marginRight: 8,
    },

    input: {
      flex: 1,
      fontSize: 14,
      color: colors.inputText,
      paddingVertical: Platform.OS === "ios" ? 10 : 6,
    },
  });
