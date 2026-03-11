import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export default function ErrorScreen({ error, onRetry, title = "Something went wrong" }) {
  const theme = useCurrentTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.appBg }]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={[styles.title, { color: theme.colors.headingText }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.colors.bodyText }]}>{error?.message || "An unexpected error occurred. Please try again."}</Text>
      {onRetry && (
        <Pressable style={[styles.retryButton, { backgroundColor: theme.colors.buttonPrimaryBg }]} onPress={onRetry}>
          <Text style={[styles.retryText, { color: theme.colors.buttonPrimaryText }]}>Try Again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
