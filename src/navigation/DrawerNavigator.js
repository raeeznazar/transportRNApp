import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { SecureStoreService } from "../../services/keychainService";
import { useAuthStore, useSectionData } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import DashboardHomeScreen from "../screens/DashboardHomeScreen";
import OutWardScreen from "../screens/OutWardScreen";
import RevenueScreen from "../screens/RevenueScreen";
import SalesScreen from "../screens/SalesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CustomDrawerContent from "./CustomDrawerContent";
import InwardsNavigator from "./InwardsNavigator";

export default function DrawerNavigator() {
  const Drawer = createDrawerNavigator();
  const navigation = useNavigation();
  const theme = useCurrentTheme();
  const sessionData = useSectionData();
  const { clearAuth } = useAuthStore();

  // Guard: Redirect if no session data
  useEffect(() => {
    if (!sessionData) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Setup" }],
      });
    }
  }, [sessionData, navigation]);

  const handleLogout = async () => {
    try {
      await SecureStoreService.clearCredentials();
      clearAuth(); // Clear zustand store
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getHeaderTitle = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? "InwardsList";

    switch (routeName) {
      case "InwardsList":
        return "Inwards List";
      case "InwardScanningScreen":
        return "Inward Scanning";
      case "InwardesDetails":
        return "Inward Details";
      case "ManifestDetails":
        return "Manifest Details";
      case "TruckArrivalSheetScreen":
        return "Truck Arrival Sheet";
      default:
        return "Inwards";
    }
  };

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: theme?.colors?.headerText,
        headerStyle: { backgroundColor: theme?.colors?.headerBg },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color={theme?.colors?.headerText} />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardHomeScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Inwards"
        component={InwardsNavigator}
        options={({ route }) => ({
          title: getHeaderTitle(route),
          drawerItemStyle: { display: "none" },
        })}
      />
      <Drawer.Screen
        name="Outward"
        component={OutWardScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Sales"
        component={SalesScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Revenue"
        component={RevenueScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
}
