import { NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { queryClient } from "./config/queryClient";
import { toastConfig } from "./config/toastConfig";
import "./global.css";
import RootNavigator from "./src/navigation/RootNavigator";
import { initializeAuthStore } from "./stores/initializeStore";
import { useThemeStore } from "./stores/themeStore";

export default function App() {
  const { loadTheme } = useThemeStore();
  useEffect(() => {
    initializeAuthStore();
    loadTheme();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}
