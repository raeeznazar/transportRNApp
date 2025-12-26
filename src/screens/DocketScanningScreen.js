import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../stores/themeStore";
export default function DocketScanningScreen() {
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <Text style={{ color: theme.colors.bodyText }}>Docket Scanning Screen</Text>
    </View>
  );
}
