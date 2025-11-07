import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { theme } from "../../constants/theme";
import InwardesDetailsScreen from "../screens/InwardesDetails";
import InwardScanning from "../screens/InwardScanning";
import LoginScreen from "../screens/LoginScreen";
import ManifestDetailScreen from "../screens/ManifestDetail";
import SetupScreen from "../screens/SetupScreen";
import SplashScreen from "../screens/Spash";
import TabNavigator from "./TabNavigator";
const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
      {/* Drawer contains Dashboard Tabs + other pages */}
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="InwardesDetails"
        component={InwardesDetailsScreen}
        options={{
          headerShown: true,
          title: "Inward Details",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.textSecondary,
          headerStyle: {
            backgroundColor: theme?.colors?.background,
          },
        }}
      />
      <Stack.Screen
        name="ManifestDetails"
        component={ManifestDetailScreen}
        options={{
          headerShown: true,
          title: "Manifest Details",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.textSecondary,
          headerStyle: {
            backgroundColor: theme?.colors?.background,
          },
        }}
      />
      <Stack.Screen
        name="InwardScanning"
        component={InwardScanning}
        options={{
          headerShown: true,
          title: "Inward Scanning",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.textSecondary,
          headerStyle: {
            backgroundColor: theme?.colors?.background,
          },
        }}
      />
    </Stack.Navigator>
  );
}
