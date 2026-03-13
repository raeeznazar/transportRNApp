import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import { ProtectedScreen } from "../components/ProtectedScreen";
import HamlyDetailScreen from "../screens/hamly/HamlyDetailScreen";
import HamlyEntryScreen from "../screens/hamly/HamlyEntryScreen";

const Stack = createNativeStackNavigator();

const ProtectedHamlyEntryScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <HamlyEntryScreen {...props} />
  </ProtectedScreen>
);

const ProtectedHamlyDetailScreen = (props) => (
  <ProtectedScreen requireUser={true} requireSession={true}>
    <HamlyDetailScreen {...props} />
  </ProtectedScreen>
);

export default function HamlyNavigator() {
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
        name="HamlyEntry"
        component={ProtectedHamlyEntryScreen}
        options={{
          headerShown: false,
          title: "Hamly",
        }}
      />

      <Stack.Screen
        name="HamilyDetail"
        component={ProtectedHamlyDetailScreen}
        options={{
          headerShown: false,
          title: "Hamly Detail",
        }}
      />
    </Stack.Navigator>
  );
}
