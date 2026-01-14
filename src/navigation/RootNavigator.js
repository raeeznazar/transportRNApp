import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProtectedScreen } from "../components/ProtectedScreen";
import LoginScreen from "../screens/LoginScreen";
import SetupScreen from "../screens/SetupScreen";
import SplashScreen from "../screens/Spash";
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

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Setup requires user only */}
      <Stack.Screen name="Setup" component={ProtectedSetupScreen} />

      {/* Main requires user + session */}
      <Stack.Screen name="Main" component={ProtectedTabNavigator} />
    </Stack.Navigator>
  );
}
