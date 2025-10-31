import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
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
    </Stack.Navigator>
  );
}
