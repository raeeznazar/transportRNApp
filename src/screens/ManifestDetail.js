import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetManifestTable } from "../../hooks/useApiQueries";
import { useCurrentTheme } from "../../stores/themeStore";
import ReactNativeTable from "../components/ReactNativeTable";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

const COLUMNS = [
  { label: "Manifest No.", key: "manNo", width: 160 },
  { label: "Manifest Weight", key: "manifestWeight", width: 160 },
  { label: "Manifest Packets", key: "manifestPackets", width: 140 },
  { label: "Vehicle", key: "vehicle", width: 160 },
  { label: "Manifest Date", key: "manifestDate", width: 160, render: (value) => formatDate(value) },
  { label: "AlsNo", key: "alsNo", width: 140 },
  { label: "Total Dockets", key: "docketID", width: 140 },
  { label: "Docket Date", key: "docketDate", width: 140, render: (value) => formatDate(value) },
  { label: "Consignor Name", key: "consignorName", width: 200 },
  { label: "Consignor Cust ID", key: "consignorCustID", width: 140 },
  { label: "Consignee Name", key: "consigneeName", width: 200 },
  { label: "Consignee Cust ID", key: "consigneeCustID", width: 140 },
];

export default function ManifestDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const theme = useCurrentTheme();
  const { manifestId } = route.params;

  const { data, isLoading, isError, error, refetch } = useGetManifestTable(manifestId);
  console.log("Manifest Detail Data:", data, "Loading:", isLoading, "Error:", isError, "Error Details:", error);
  // Loading state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.appBg }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 8, color: theme.colors.bodyText }}>Loading manifest details...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20, backgroundColor: theme.colors.appBg }}>
        <Text style={{ color: theme.colors.danger, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>Error Loading Data</Text>
        <Text style={{ color: theme.colors.bodyText, textAlign: "center", marginBottom: 16 }}>
          {error?.message || "Failed to load manifest details"}
        </Text>
      </View>
    );
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.appBg }}>
        <Text style={{ color: theme.colors.bodyText, fontSize: 16 }}>No data found</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right, backgroundColor: theme.colors.appBg }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 16, color: theme.colors.headingText, paddingHorizontal: 16, paddingTop: 16 }}>
        Manifest Details
      </Text>
      <ReactNativeTable columns={COLUMNS} data={data} />
    </View>
  );
}
