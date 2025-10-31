import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";
import RootNavigator from "./src/navigation/RootNavigator";
// Load global.css only when running on the web (react-native-web / Expo web).
// Native bundlers (iOS/Android) don't support importing .css files, so require
// it conditionally to avoid build errors.

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {/* <RootNavigator initialRoute={isLoggedIn ? "Main" : "Login"} /> */}
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
