import { StyleSheet, Text, View } from "react-native";

export default function RevenueScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue</Text>
      <Text>Demo Revenue page in Drawer.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
});
