import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

/**
 * TextArea Component Usage Guide
 *
 * Reusable multiline input with app-theme support from `themeStore`.
 * This component uses `useCurrentTheme()` selector to read `theme.colors`
 * and apply consistent input styling across all themes.
 *
 * ✅ Props
 * - label?: string
 *   Optional field label shown above the textarea.
 *
 * - value?: string
 *   Controlled input value.
 *
 * - onChangeText?: (text: string) => void
 *   Change handler for controlled usage.
 *
 * - placeholder?: string
 *   Placeholder text.
 *
 * - disabled?: boolean (default: false)
 *   Disables editing and applies disabled styles.
 *
 * - readOnly?: boolean (default: false)
 *   Read-only mode while keeping normal visual style.
 *
 * - numberOfLines?: number (default: 4)
 *   Initial multiline height behavior.
 *
 * - containerStyle?: ViewStyle
 *   Style override for wrapper container.
 *
 * - inputStyle?: TextStyle
 *   Style override for TextInput.
 *
 * - labelStyle?: TextStyle
 *   Style override for label.
 *
 * - ...props
 *   Any additional React Native TextInput props (e.g. maxLength, keyboardType).
 *
 * ✅ Theme integration
 * - Uses `useCurrentTheme()` from `../../stores/themeStore`.
 * - Reads color tokens from `theme.colors`:
 *   - inputText
 *   - inputPlaceholder
 *   - inputBorder
 *   - inputBg
 *   - buttonDisabledBg
 *
 * ✅ Basic usage
 * <TextArea
 *   label="Remarks"
 *   value={remarks}
 *   onChangeText={setRemarks}
 *   placeholder="Enter remarks"
 * />
 *
 * ✅ Disabled usage
 * <TextArea
 *   label="Notes"
 *   value={notes}
 *   disabled
 * />
 *
 * ✅ With custom styles
 * <TextArea
 *   label="Description"
 *   value={description}
 *   onChangeText={setDescription}
 *   numberOfLines={6}
 *   containerStyle={{ marginTop: 8 }}
 *   inputStyle={{ minHeight: 140 }}
 * />
 */

const TextArea = ({
  label,
  value,
  onChangeText,
  placeholder,
  disabled = false,
  readOnly = false,
  numberOfLines = 4,
  containerStyle,
  inputStyle,
  labelStyle,
  ...props
}) => {
  const theme = useCurrentTheme();
  const { colors } = theme;
  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      <TextInput
        value={value}
        onChangeText={disabled ? undefined : onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        editable={!disabled}
        selectTextOnFocus={!disabled}
        style={[styles.input, disabled && styles.disabledInput, inputStyle]}
        autoCapitalize="sentences"
        autoCorrect={false}
        readOnly={readOnly}
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        {...props}
      />
    </View>
  );
};

export default React.memo(TextArea);

const makeStyles = (colors) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginTop: 12,
    },

    label: {
      fontSize: 12,
      color: colors.inputText,
      marginBottom: 6,
      fontWeight: "500",
    },

    input: {
      minHeight: 96,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.inputText,
      backgroundColor: colors.inputBg,
      fontFamily: "Figtree-Regular",
    },

    disabledInput: {
      backgroundColor: colors.buttonDisabledBg,
      color: colors.inputPlaceholder,
    },
  });
