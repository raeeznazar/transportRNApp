import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import { ProtectedScreen } from "../components/ProtectedScreen";
import DocketScanSummaryScreen from "../screens/DockectScanSummaryScreen";
import DockectShowPendingPackets from "../screens/DockectShowPendingPackets";
import DocketAddExtra from "../screens/DocketAddExtra";
import DocketMissingPacketsAdd from "../screens/DocketMissingPacketsAdd";
import DocketScanningScreen from "../screens/DocketScanningScreen";
import InwadesScreen from "../screens/InwadesScreen";
import InwardesDetailsScreen from "../screens/InwardesDetails";
import ManifestDetailScreen from "../screens/ManifestDetail";
import TruckArivalScreeAfterReport from "../screens/TruckArivalScreeAfterReport";
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

const ProtectedTruckArivalAfterReportScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <TruckArivalScreeAfterReport {...props} />
  </ProtectedScreen>
);

const ProtectedDocketScanningScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <DocketScanningScreen {...props} />
  </ProtectedScreen>
);

const ProtectedDocketMissingPacketsAdd = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <DocketMissingPacketsAdd {...props} />
  </ProtectedScreen>
);
const ProtectedDocketScanSummaryScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <DocketScanSummaryScreen {...props} />
  </ProtectedScreen>
);
const ProtectedDockectShowPendingPackets = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <DockectShowPendingPackets {...props} />
  </ProtectedScreen>
);

const ProtectedDockectAddExtra = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <DocketAddExtra {...props} />
  </ProtectedScreen>
);

export default function InwardsNavigator() {
  const theme = useCurrentTheme();

  return (
    <Stack.Navigator
      screenOptions={{
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
        name="InwardesDetails"
        component={ProtectedInwardesDetailsScreen}
        options={{
          headerShown: true,
          title: "Inwardes Details",
        }}
      />
      <Stack.Screen
        name="ManifestDetails"
        component={ProtectedManifestDetailScreen}
        options={{
          headerShown: true,
          title: "Manifest Details",
        }}
      />
      <Stack.Screen
        name="TruckArrivalSheetScreen"
        component={ProtectedTruckArrivalSheetScreen}
        options={{
          headerShown: true,
          title: "Arrival Sheet",
        }}
      />

      <Stack.Screen
        name="DocketScanningScreen"
        component={ProtectedDocketScanningScreen}
        options={{
          headerShown: true,
          title: "Docket Scanning",
          headerStatusBarHeight: 0,
          headerTitleStyle: {
            marginTop: 8,
          },
        }}
      />
      <Stack.Screen
        name="TruckUnloadingScreen"
        component={ProtectedUnloadingScreen}
        options={{
          headerShown: false,
          title: "Truck Unloading Screen",
        }}
      />
      <Stack.Screen
        name="TruckArivalAfterReportScreen"
        component={ProtectedTruckArivalAfterReportScreen}
        options={{
          headerShown: false,
          title: "Truck Arrival Sheet",
        }}
      />

      <Stack.Screen
        name="DocketMissingPacketsAdd"
        component={ProtectedDocketMissingPacketsAdd}
        options={{
          headerShown: true,
          title: "Docket Missing Packets Add",
        }}
      />
      <Stack.Screen
        name="DocketScanSummaryScreen"
        component={ProtectedDocketScanSummaryScreen}
        options={{
          headerShown: true,
          title: "Docket Scan Summary",
        }}
      />
      <Stack.Screen
        name="DocketPedningScreen"
        component={ProtectedDockectShowPendingPackets}
        options={{
          headerShown: true,
          title: "Docket Pending Packets",
        }}
      />
      <Stack.Screen
        name="DocketAddExtra"
        component={ProtectedDockectAddExtra}
        options={{
          headerShown: true,
          title: "Docket Add Extra",
        }}
      />
    </Stack.Navigator>
  );
}
