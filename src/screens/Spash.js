import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SecureStoreService } from "../../services/keychainService";
import { useAuthStore } from "../../stores/authStore";

const SplashScreen = () => {
  const navigation = useNavigation();
  const { setUser, setSessionData } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Show splash for minimum time
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const credentials = await SecureStoreService.getCredentials();
        console.log("Auto-login check result:", credentials);
        if (credentials?.token && credentials?.user) {
          // User is logged in
          setUser(credentials.user);

          // Check if session data exists
          if (credentials.sessionData) {
            setSessionData(credentials.sessionData);
            // Has both user and session - go to Main
            navigation.reset({
              index: 0,
              routes: [{ name: "Main" }],
            });
          } else {
            // Has user but no session - go to Setup
            navigation.reset({
              index: 0,
              routes: [{ name: "Setup" }],
            });
          }
        } else {
          // No auth - go to Login
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigation.replace("Login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>neoERA</Text>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 20,
  },
});

export default SplashScreen;
