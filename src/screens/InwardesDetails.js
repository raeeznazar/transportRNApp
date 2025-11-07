import { useNavigation } from "@react-navigation/native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InwardesDetailsScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { inwardId } = route.params;
  const navigation = useNavigation();

  const handleCardPress = () => {
    navigation.navigate("ManifestDetails", {
      manifestId: "25", // or whatever unique identifier you have
    });
  };

  return (
    <View style={{ flex: 1, paddingTop: 0, paddingBottom: insets.bottom }}>
      <ScrollView className="flex-1 p-4">
        <Text className="text-2xl font-bold mb-4 text-textPrimary">Manifest List</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleCardPress} className="bg-white p-4 rounded-lg shadow">
          <View className="bg-white p-4 rounded-lg ">
            <Text className="text-lg font-semibold mb-2 text-textSecondary">Manifest No:</Text>
            <Text className="text-textSecondary">Date: </Text>
            <Text className="text-textSecondary">Branch: </Text>
            <Text className="text-textSecondary">Total Packets:</Text>
            <Text className="text-textSecondary">Total Weight: kg</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
