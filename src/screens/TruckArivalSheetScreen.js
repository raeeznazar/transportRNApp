import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetTruckArrivalSheetHeader, useGetTruckArrivalSheetTable } from "../../hooks/useApiQueries";
import { useCurrentTheme } from "../../stores/themeStore";

export default function TruckArrivalSheetScreen() {
  const insets = useSafeAreaInsets();
  const theme = useCurrentTheme();
  const route = useRoute();
  const { thcId } = route.params; // Get thcId from navigation params

  // Fetch truck arrival sheet data
  const { data: arrivalSheetHeaderData, isLoading, isError, error, refetch } = useGetTruckArrivalSheetHeader(thcId);
  const { data: arrivalSheetTableData } = useGetTruckArrivalSheetTable(thcId);

  const transformData = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }
    return data.map((item, index) => ({
      id: index + 1,
      docketNumber: item.docketNo,
      delivered: item.doorDelivery,
      toStation: item.toStationID,
      packet: item.packet,
      weight: item.weight,
    }));
  };

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

  const tableData = transformData(arrivalSheetTableData);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Section */}
      <View style={[styles.headerSection, { backgroundColor: theme.colors.primary }]} className="w-full px-4 py-4 mb-4">
        <View className="flex-row flex-wrap gap-2">
          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">TAS No:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.tasNo}</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">TAS Date:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.tasDate}</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Total Docket Packets:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.totalDocketPackets}</Text>
          </View>
          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Total Packets:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.totalPacket}</Text>
          </View>
          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Total Weight:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.totalWeight}</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Truck:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.truckNo}</Text>
          </View>

          <View className="flex-row items-center bg-white/15 rounded px-2 py-1.5">
            <Text className="text-white/70 text-xs mr-1">Driver:</Text>
            <Text className="text-white text-xs font-semibold">{arrivalSheetHeaderData?.driversName}</Text>
          </View>
        </View>
      </View>

      {/* Table Section */}
      <View style={styles.tableWrapper}>
        <View style={[styles.tableContainer, { backgroundColor: theme.colors.card }]} className="mx-3 rounded-lg overflow-hidden">
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
          <FlatList
            data={tableData}
            renderItem={renderTableRow}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Button Section */}
      {/* <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => console.log('Button pressed')}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View> */}
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
  tableWrapper: {
    flex: 1,
    marginBottom: 80, // Space for button
  },
  tableContainer: {
    flex: 1,
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
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
