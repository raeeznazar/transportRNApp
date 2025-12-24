import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetManifestIdList } from "../../hooks/useApiQueries";
import { useCurrentTheme } from "../../stores/themeStore";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
}

export default function InwardesDetailsScreen({ route }) {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const { inwardId, thcId, toStation } = route.params;
  console.log("Inward Details Screen Params:", route.params);
  const { data, isLoading, isError, error, refetch } = useGetManifestIdList(thcId, toStation);
  console.log("Inward Details Manifest ID List Data:", data, "Loading:", isLoading, "Error:", isError, "Error Details:", error);
  const navigation = useNavigation();

  const handleCardPress = (manID) => {
    navigation.navigate("ManifestDetails", {
      manifestId: manID,
    });
  };

  const renderCard = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleCardPress(item.manID)}
      className="rounded-xl p-4 mx-4 mb-3 border"
      style={{
        backgroundColor: theme.colors.cardBg,
        borderColor: theme.colors.cardBorder,
      }}
    >
      {/* Details Grid */}
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            Manifest Number
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {item.manNo}
          </Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            Branch
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {item.fromBranchName}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            Date
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {formatDate(item.entryDate)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            Total Dockets
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {item.totalDockets}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            Total Packets
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {item.totalPackets}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            Total Weight
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {item.weight}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm" style={{ color: theme.colors.bodyText }}>
            DDST Weight
          </Text>
          <Text className="text-sm font-semibold" style={{ color: theme.colors.bodyText }}>
            {item.weight}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: insets.bottom, backgroundColor: theme.colors.appBg }}>
      <View className="flex-row">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View
            className="flex-row items-center"
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 8,
              marginTop: 10,
              paddingVertical: 8,
              paddingHorizontal: 8,
              backgroundColor: "#F5F5F5",
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#050404ff" />
            <Text style={{ marginLeft: 4, color: "#060606ff" }}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="mt-2" style={{ color: theme.colors.bodyText }}>
            Loading manifests...
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, idx) => item.manID?.toString() || idx.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingTop: 5, paddingBottom: 16 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-base" style={{ color: theme.colors.bodyText }}>
                No data found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
