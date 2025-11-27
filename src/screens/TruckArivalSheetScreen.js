import { Ionicons } from "@expo/vector-icons";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../stores/themeStore";

export default function TruckArrivalSheetScreen() {
  const insets = useSafeAreaInsets();
  const theme = useCurrentTheme();

  // Sample data - replace with your actual data
  const tableData = [
    { id: 1, docketNumber: "DKT001", delivered: true, toStation: "Station A", packet: 25, weight: 150 },
    { id: 2, docketNumber: "DKT002", delivered: false, toStation: "Station B", packet: 30, weight: 200 },
    { id: 3, docketNumber: "DKT003", delivered: true, toStation: "Station C", packet: 15, weight: 120 },
    { id: 4, docketNumber: "DKT004", delivered: true, toStation: "Station D", packet: 40, weight: 280 },
    { id: 5, docketNumber: "DKT005", delivered: false, toStation: "Station E", packet: 20, weight: 180 },
    { id: 6, docketNumber: "DKT006", delivered: true, toStation: "Station F", packet: 35, weight: 220 },
    { id: 7, docketNumber: "DKT007", delivered: false, toStation: "Station G", packet: 18, weight: 140 },
  ];

  const renderTableRow = ({ item, index }) => (
    <View
      style={[
        styles.tableRow,
        {
          backgroundColor: index % 2 === 0 ? theme.colors.card : theme.colors.background,
          borderBottomColor: theme.colors.border,
        },
      ]}
      className="flex-row items-center"
    >
      <Text style={[styles.tableCell, { color: theme.colors.text }]} className="flex-1 px-2 py-3 text-center">
        {item.docketNumber}
      </Text>
      <View style={styles.tableCell} className="flex-1 px-2 py-3 items-center justify-center">
        {item.delivered ? <Ionicons name="checkmark-circle" size={22} color="#10b981" /> : <Ionicons name="close-circle" size={22} color="#ef4444" />}
      </View>
      <Text style={[styles.tableCell, { color: theme.colors.text }]} className="flex-1 px-2 py-3 text-center">
        {item.toStation}
      </Text>
      <Text style={[styles.tableCell, { color: theme.colors.text }]} className="flex-1 px-2 py-3 text-center">
        {item.packet}
      </Text>
      <Text style={[styles.tableCell, { color: theme.colors.text }]} className="flex-1 px-2 py-3 text-center">
        {item.weight}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Section */}
      <View style={[styles.headerSection, { backgroundColor: theme.colors.primary }]} className="w-full px-4 py-4 mb-4">
        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">TAS No:</Text>
            <Text className="text-white text-xs font-semibold">TAS-2024-001</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">TAS Date:</Text>
            <Text className="text-white text-xs font-semibold">27/11/2025</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">THC:</Text>
            <Text className="text-white text-xs font-semibold">THC-456</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Truck:</Text>
            <Text className="text-white text-xs font-semibold">TRK-789</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Driver:</Text>
            <Text className="text-white text-xs font-semibold">John Doe</Text>
          </View>
        </View>
      </View>

      {/* Table Section */}
      <View style={[styles.tableContainer, { backgroundColor: theme.colors.card }]} className="flex-1 mx-3 rounded-lg overflow-hidden">
        {/* Table Header */}
        <View style={[styles.tableHeader, { backgroundColor: theme.colors.primary }]} className="flex-row">
          <Text style={styles.tableHeaderText} className="flex-1 px-2 py-2.5 text-center text-white font-semibold text-xs">
            Docket No
          </Text>
          <Text style={styles.tableHeaderText} className="flex-1 px-2 py-2.5 text-center text-white font-semibold text-xs">
            Door
          </Text>
          <Text style={styles.tableHeaderText} className="flex-1 px-2 py-2.5 text-center text-white font-semibold text-xs">
            To Station
          </Text>
          <Text style={styles.tableHeaderText} className="flex-1 px-2 py-2.5 text-center text-white font-semibold text-xs">
            Packet
          </Text>
          <Text style={styles.tableHeaderText} className="flex-1 px-2 py-2.5 text-center text-white font-semibold text-xs">
            Weight
          </Text>
        </View>

        {/* Table Body */}
        <FlatList data={tableData} renderItem={renderTableRow} keyExtractor={(item) => item.id.toString()} showsVerticalScrollIndicator={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableContainer: {
    // Remove or comment out these shadow properties
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
  },
  tableHeader: {},
  tableHeaderText: {
    fontSize: 12,
  },
  tableRow: {
    minHeight: 45,
    borderBottomWidth: 0.5,
  },
  tableCell: {
    fontSize: 12,
  },
});
