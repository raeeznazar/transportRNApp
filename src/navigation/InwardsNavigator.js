import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProtectedScreen } from "../../components/ProtectedScreen";
import { useCurrentTheme } from "../../stores/themeStore";
import InwadesScreen from "../screens/InwadesScreen";
import InwardesDetailsScreen from "../screens/InwardesDetails";
import InwardScanning from "../screens/InwardScanning";
import ManifestDetailScreen from "../screens/ManifestDetail";
import TruckArrivalSheetScreen from "../screens/TruckArivalSheetScreen";
import TruckUnloadingScreen from "../screens/TruckUnloadingScreen";

const Stack = createNativeStackNavigator();

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

const ProtectedUnloadingScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <TruckUnloadingScreen {...props} />
  </ProtectedScreen>
);

export default function InwardsNavigator() {
  const theme = useCurrentTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: theme?.colors?.headerText,
        headerStyle: {
          backgroundColor: theme?.colors?.headerBg,
        },
      }}
    >
      <Stack.Screen
        name="InwardsList"
        component={InwadesScreen}
        options={{
          headerShown: false,
          title: "Inwards List",
        }}
      />
      <Stack.Screen
        name="InwardScanningScreen"
        component={ProtectedInwardScanning}
        options={{
          headerShown: false,
          title: "Inward Scanning",
        }}
      />
      <Stack.Screen
        name="InwardesDetails"
        component={ProtectedInwardesDetailsScreen}
        options={{
          title: "Inward Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="ManifestDetails"
        component={ProtectedManifestDetailScreen}
        options={{
          title: "Manifest Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="TruckArrivalSheetScreen"
        component={ProtectedTruckArrivalSheetScreen}
        options={{
          title: "Truck Arrival Sheet",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="TruckUnloadingScreen"
        component={ProtectedUnloadingScreen}
        options={{
          title: "Truck Unloading Screen",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
}
