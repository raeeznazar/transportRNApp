import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute, useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import { SecureStoreService } from "../../services/keychainService";
import { useAuthStore, useSectionData } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";
import DashboardHomeScreen from "../screens/DashboardHomeScreen";
import RevenueScreen from "../screens/RevenueScreen";
import SettingsScreen from "../screens/SettingsScreen";
import CustomDrawerContent from "./CustomDrawerContent";
import InwardsNavigator from "./InwardsNavigator";
import OutwardsNavigator from "./OutwardsNavigator";
import TrackingNavigator from "./TrackingNavigator";

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
    const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;
    switch (routeName) {
      case "InwardsList":
        return "Inwards List";
      case "InwardesDetails":
        return "Manifest List";
      case "ManifestDetails":
        return "Manifest Details";
      case "TruckArivalAfterReportScreen":
        return "Truck Arrival Sheet";
      case "TruckArrivalSheetScreen":
        return "Arrival Sheet";
      case "TruckUnloadingScreen":
        return "Truck Unloading";
      case "DocketScanningScreen":
        return "Docket Scanning";
      case "DocketMissingPacketsAdd":
      case "OutWadresAddShortList":
        return "Docket Missing Packets Add";
      case "DocketScanSummaryScreen":
        return "Docket Scan Summary";
      case "DocketPedningScreen":
        return "Docket Pending Packets";
      case "TrackingHome":
      case "Tracking":
        return "Tracking";
      case "Outwards":
        return "Pending Preloading";
      case "OutwardsList":
        return "Pending Preloading";
      case "OutWadesDirectALS":
      case "OutWadesALSscreen":
        return "Actual Loading Sheet";
      case "OutWadesScanning":
        return "OutWades Scanning";
      case "OutwadesDocketsRemoval":
        return "Outwades Docket Removal";
      case "OutwadesSummaryScreen":
        return "Outwards Summary";
      case "OutwardsSummaryPendingPackets":
        return "Outwards Summary Pending Packets";
      default:
        return "NeoEra Transport";
    }
  };

  const shouldHideDrawerHeader = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? route.name;

    // List of main/root screens that should show the drawer header
    const mainScreens = [
      "InwardsList",
      "TruckArivalAfterReportScreen",
      "TruckUnloadingScreen",
      "TrackingHome",
      "OutwardsList",
      "Outwards",
      "Tracking",
    ];
    // If routeName is not in mainScreens and exists, hide drawer header
    // This allows nested/detail screens to show their own headers with back buttons
    return routeName && !mainScreens.includes(routeName);
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
          headerShown: !shouldHideDrawerHeader(route),
        })}
      />
      <Drawer.Screen
        name="Outwards"
        component={OutwardsNavigator}
        options={({ route }) => ({
          title: getHeaderTitle(route),
          drawerItemStyle: { display: "none" },
          headerShown: !shouldHideDrawerHeader(route),
        })}
      />
      <Drawer.Screen
        name="Tracking"
        component={TrackingNavigator}
        options={({ route }) => ({
          title: getHeaderTitle(route),
          drawerItemStyle: { display: "none" },
          headerShown: !shouldHideDrawerHeader(route),
        })}
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
