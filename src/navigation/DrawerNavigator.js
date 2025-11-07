import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { theme } from "../../constants/theme";
import { SecureStoreService } from "../../services/keychainService";
import DashboardHomeScreen from "../screens/DashboardHomeScreen";
import InwadesScreen from "../screens/InwadesScreen";
import OutWardScreen from "../screens/OutWardScreen";
import RevenueScreen from "../screens/RevenueScreen";
import SalesScreen from "../screens/SalesScreen";

export default function DrawerNavigator() {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();
  const handleLogout = async () => {
    try {
      await SecureStoreService.clearCredentials();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerTintColor: theme?.colors?.textSecondary,
        headerStyle: { backgroundColor: theme?.colors?.background },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color={theme?.colors?.textSecondary} />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardHomeScreen} />
      <Drawer.Screen name="Inwades" component={InwadesScreen} />
      <Drawer.Screen name="Outward" component={OutWardScreen} />
      <Drawer.Screen name="Sales" component={SalesScreen} />
      <Drawer.Screen name="Revenue" component={RevenueScreen} />
    </Drawer.Navigator>
  );
}
