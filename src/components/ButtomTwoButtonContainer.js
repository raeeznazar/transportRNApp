import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ButtonContainer({ children }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="mx-4 flex-row gap-3"
      style={{
        paddingBottom: insets.bottom + (Platform.OS === "ios" ? 20 : 0),
        paddingTop: insets.top,
      }}
    >
      {children}
    </View>
  );
}
