import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ReactNativeTable from "../components/ReactNativeTable";
const COLUMNS = [
  { label: "Truck No", key: "truckNo", width: 140 },
  { label: "From Branch", key: "fromBranch", width: 160 },
  { label: "To Branch", key: "toBranch", width: 160 },
  { label: "THC Date", key: "thcDate", width: 140 },
  { label: "Driver", key: "driverName", width: 160 },
  { label: "Phone", key: "driverPhone", width: 160 },
  { label: "Load Type", key: "loadType", width: 140 },
  { label: "Status", key: "status", width: 140 },
];

export default function ManifestDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { manifestId } = route.params;

  const [rows, setRows] = useState(null);

  useEffect(() => {
    const mock = [
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
      {
        truckNo: "TN09 AB 1234",
        fromBranch: "Chennai",
        toBranch: "Bengaluru",
        thcDate: "2025-11-10",
        driverName: "Ramesh",
        driverPhone: "9876543210",
        loadType: "FTL",
        status: "In Transit",
      },
    ];
    setRows(mock);
  }, []);

  if (!rows)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom }}>
      <Text className="text-2xl font-bold mb-4 text-textPrimary px-4 pt-4">Manifest Details</Text>
      {/* <View className="px-4 mb-2"> */}
      <ReactNativeTable columns={COLUMNS} data={rows} />
      {/* </View> */}
    </View>
  );
}
