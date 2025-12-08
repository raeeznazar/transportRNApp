import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuthStore, useIsAuthenticated, useSectionData } from "../stores/authStore";

export const ProtectedScreen = ({ children, requireUser = false, requireSession = false }) => {
  const navigation = useNavigation();
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((state) => state.user);
  const sessionData = useSectionData();

  useEffect(() => {
    // Check authentication requirements
    if (requireUser && !user) {
      // No user - redirect to login
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
      return;
    }

    if (requireSession && !sessionData) {
      // Has user but no session - redirect to setup
      navigation.reset({
        index: 0,
        routes: [{ name: "Setup" }],
      });
      return;
    }
  }, [user, sessionData, requireUser, requireSession, navigation]);

  // Show loading while checking
  if (requireUser && !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (requireSession && !sessionData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
