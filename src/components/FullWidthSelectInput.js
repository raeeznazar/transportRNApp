import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export default function FullWidthSelectInput({
  label,
  value,
  onChange,
  items = [],
  className, // if you use a Tailwind/className setup this will apply
  style,
  placeholderText,
  ...rest
}) {
  return (
    <View className={className} style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.pickerWrap} className="rounded mb-1">
        <Picker selectedValue={value} onValueChange={onChange} {...rest}>
          <Picker.Item
            label={placeholderText ?? `Select ${label ?? "option"}`}
            value={undefined}
            color={theme.colors.textSecondary}
            enabled={false}
          />
          {items.map((it) => (
            <Picker.Item key={it.value} label={it.label} value={it.value} color={theme.colors.textSecondary} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { marginBottom: 6, fontWeight: "600", color: theme.colors.textPrimary },
  pickerWrap: {
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.inputBackground,
    overflow: "hidden",
    // color: theme.colors.inputText,
  },
});
