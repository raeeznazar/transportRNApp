import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../constants/theme";

export default function DashboardHomeScreen({ route }) {
  const filters = route?.params?.filters; // may be undefined on first mount
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <Text>Welcome to your home screen.</Text>
      {filters && (
        <Text style={{ marginTop: 8 }}>
          Filters: {filters.region} / {filters.branch} / {filters.corporate} / {filters.year}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6, color: theme.colors.textSecondary },
});
