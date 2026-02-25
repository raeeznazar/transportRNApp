import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import OutWadesAddShortList from "../screens/outWades/OutWadesAddShortList";
import OutWadesALSscreen from "../screens/outWades/OutWadesALSscreen";
import OutWadesDirectALS from "../screens/outWades/OutWadesDirectALS";
import OutwadesDirectALSSummaryScreen from "../screens/outWades/OutwadesDirectALSSummaryScreen";
import OutwadesDocketsRemoval from "../screens/outWades/OutwadesDocketsRemoval";
import OutWadesEnteryScreen from "../screens/outWades/OutWadesEnteryScreen";
import OutWadesScanning from "../screens/outWades/OutWadesScanning";
import OutwadesSummaryScreen from "../screens/outWades/OutwadesSummaryScreen";
import OutwardsSummaryPendingPackets from "../screens/outWades/OutwardsSummaryPendingPackets";
const Stack = createNativeStackNavigator();
export default function OutwardsNavigator() {
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
        name="OutwardsList"
        component={OutWadesEnteryScreen}
        options={{
          headerShown: false,
          title: "Pending Preloading",
          unmountOnBlur: true,
        }}
      />

      <Stack.Screen
        name="OutWadesALSscreen"
        component={OutWadesALSscreen}
        options={{
          headerShown: true,
          title: "Actual Loading Sheet",
          unmountOnBlur: true,
        }}
      />

      <Stack.Screen
        name="OutWadesDirectALS"
        component={OutWadesDirectALS}
        options={{
          headerShown: true,
          title: "Actual Loading Sheet",
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="OutWadesScanning"
        component={OutWadesScanning}
        options={{
          headerShown: true,
          title: "Outwards Scanning",
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="OutWadesAddShortList"
        component={OutWadesAddShortList}
        options={{
          headerShown: true,
          title: "Docket Missing Packets Add",
          unmountOnBlur: true,
        }}
      />

      <Stack.Screen
        name="OutwadesDocketsRemoval"
        component={OutwadesDocketsRemoval}
        options={{
          headerShown: true,
          title: "Outwades Docket Removal",
          unmountOnBlur: true,
        }}
      />

      <Stack.Screen
        name="OutwadesSummaryScreen"
        component={OutwadesSummaryScreen}
        options={{
          headerShown: true,
          title: "Outwards Summary",
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="OutwardsSummaryPendingPackets"
        component={OutwardsSummaryPendingPackets}
        options={{
          headerShown: true,
          title: "Outwards Summary Pending Packets",
          unmountOnBlur: true,
        }}
      />
      <Stack.Screen
        name="OutwadesDirectALSSummaryScreen"
        component={OutwadesDirectALSSummaryScreen}
        options={{
          headerShown: true,
          title: "Outwards Summary",
          unmountOnBlur: true,
        }}
      />
    </Stack.Navigator>
  );
}
