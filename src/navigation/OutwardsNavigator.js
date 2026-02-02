import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCurrentTheme } from "../../stores/themeStore";
import OutWadesEnteryScreen from "../screens/outWades/OutWadesEnteryScreen";
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
    </Stack.Navigator>
  );
}
