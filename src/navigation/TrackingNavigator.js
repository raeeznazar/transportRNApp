import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import { ProtectedScreen } from "../components/ProtectedScreen";
import DocketDetailsScreen from "../screens/TrackingDocketDetailsScreen";
import TreackingNoScreen from "../screens/TreackingNoScreen";

const Stack = createNativeStackNavigator();

const ProtectedDocketDetailsScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <DocketDetailsScreen {...props} />
  </ProtectedScreen>
);

export default function TrackingNavigator() {
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
        name="TrackingHome"
        component={TreackingNoScreen}
        options={{
          headerShown: false,
          title: "Tracking",
        }}
      />
      <Stack.Screen
        name="DocketDetails"
        component={ProtectedDocketDetailsScreen}
        options={{
          headerShown: true,
          title: "Tracking Docket Details",
        }}
      />
    </Stack.Navigator>
  );
}
