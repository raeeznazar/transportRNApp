import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProtectedScreen } from "../../components/ProtectedScreen";
import { useCurrentTheme } from "../../stores/themeStore";
import InwardesDetailsScreen from "../screens/InwardesDetails";
import InwardScanning from "../screens/InwardScanning";
import LoginScreen from "../screens/LoginScreen";
import ManifestDetailScreen from "../screens/ManifestDetail";
import SetupScreen from "../screens/SetupScreen";
import SplashScreen from "../screens/Spash";
import TruckArrivalSheetScreen from "../screens/TruckArivalSheetScreen";
import TabNavigator from "./TabNavigator";

const Stack = createNativeStackNavigator();

// Wrap screens with auth requirements
const ProtectedSetupScreen = (props) => (
  <ProtectedScreen requireUser={true}>
    <SetupScreen {...props} />
  </ProtectedScreen>
);

const ProtectedTabNavigator = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <TabNavigator {...props} />
  </ProtectedScreen>
);

const ProtectedInwardesDetailsScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <InwardesDetailsScreen {...props} />
  </ProtectedScreen>
);

const ProtectedManifestDetailScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <ManifestDetailScreen {...props} />
  </ProtectedScreen>
);

const ProtectedInwardScanning = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <InwardScanning {...props} />
  </ProtectedScreen>
);

const ProtectedTruckArrivalSheetScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <TruckArrivalSheetScreen {...props} />
  </ProtectedScreen>
);

export default function RootNavigator() {
  const theme = useCurrentTheme();

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Setup requires user only */}
      <Stack.Screen name="Setup" component={ProtectedSetupScreen} />

      {/* Main and all detail screens require user + session */}
      <Stack.Screen name="Main" component={ProtectedTabNavigator} />

      <Stack.Screen
        name="InwardesDetails"
        component={ProtectedInwardesDetailsScreen}
        options={{
          headerShown: true,
          title: "Inward Details",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.headerText,
          headerStyle: {
            backgroundColor: theme?.colors?.headerBg,
          },
        }}
      />
      <Stack.Screen
        name="ManifestDetails"
        component={ProtectedManifestDetailScreen}
        options={{
          headerShown: true,
          title: "Manifest Details",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.headerText,
          headerStyle: {
            backgroundColor: theme?.colors?.headerBg,
          },
        }}
      />
      <Stack.Screen
        name="InwardScanning"
        component={ProtectedInwardScanning}
        options={{
          headerShown: true,
          title: "Inward Scanning",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.headerText,
          headerStyle: {
            backgroundColor: theme?.colors?.headerBg,
          },
        }}
      />
      <Stack.Screen
        name="TruckArrivalSheetScreen"
        component={ProtectedTruckArrivalSheetScreen}
        options={{
          headerShown: true,
          title: "Truck Arrival Sheet",
          headerBackTitle: "Back",
          headerTintColor: theme?.colors?.headerText,
          headerStyle: {
            backgroundColor: theme?.colors?.headerBg,
          },
        }}
      />
    </Stack.Navigator>
  );
}
