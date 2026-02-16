import { StatusBar, StyleSheet, Text, View } from "react-native";
import { useCurrentTheme } from "../../stores/themeStore";

export default function DashboardHomeScreen({ route }) {
  const theme = useCurrentTheme();
  const filters = route?.params?.filters; // may be undefined on first mount

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.appBg }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Text style={[styles.title, { color: theme.colors.headingText }]}>Home</Text>
      <Text style={{ color: theme.colors.bodyText }}>Welcome to your home screen.</Text>
      {filters && (
        <Text style={{ marginTop: 8, color: theme.colors.bodyText }}>
          Filters: {filters.region} / {filters.branch} / {filters.corporate} / {filters.year}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
});
