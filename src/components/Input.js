import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useThemeStore } from "../../stores/themeStore";

/* ---------------- COMPONENT ---------------- */
const Input = ({ label, value, onChangeText, placeholder, disabled = false, containerStyle, inputStyle, labelStyle, readOnly = false, ...props }) => {
  const { theme } = useThemeStore();
  const { colors } = theme;

  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

      <TextInput
        value={value}
        onChangeText={disabled ? undefined : onChangeText}
        placeholder={placeholder}
        placeholderTextColor={disabled ? colors.inputPlaceholder : colors.inputPlaceholder}
        editable={!disabled}
        selectTextOnFocus={!disabled}
        style={[styles.input, disabled && styles.disabledInput, inputStyle]}
        autoCapitalize="none"
        autoCorrect={false}
        readOnly={readOnly}
        {...props}
      />
    </View>
  );
};

export default React.memo(Input);

/* ---------------- DYNAMIC STYLES ---------------- */
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
      height: 44,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 14,
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

//   <Input
//   label="Email"
//   value={email}
//   onChangeText={setEmail}
//   placeholder="Enter your email"
//   keyboardType="email-address"
// />

// <Input label="Reference" value={ref} disabled />
