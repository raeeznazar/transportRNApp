import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

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
  const theme = useCurrentTheme();
  
  return (
    <View className={className} style={[styles.wrapper, style]}>
      {label ? <Text style={[styles.label, { color: theme.colors.bodyText }]}>{label}</Text> : null}
      <View style={[styles.pickerWrap, { borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.inputBg }]} className="rounded-xl">
        <Picker selectedValue={value} onValueChange={onChange} {...rest}>
          <Picker.Item
            label={placeholderText ?? `Select ${label ?? "option"}`}
            value={undefined}
            color={theme.colors.inputPlaceholder}
            enabled={false}
          />
          {items.map((it) => (
            <Picker.Item key={it.value} label={it.label} value={it.value} color={theme.colors.inputText} />
          ))}
        </Picker>
      </View>
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
});
