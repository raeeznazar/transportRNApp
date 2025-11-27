import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SecureStoreService } from "../../services/keychainService";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuthAndNavigate();
  }, []);

  const checkAuthAndNavigate = async () => {
    try {
      // Show splash for minimum time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check authentication
      const authResult = await SecureStoreService.checkAutoLogin();
      console.log("Auto-login check result:", authResult);
      if (authResult.success && authResult.hasCompleteSession) {
        // if (authResult.hasCompleteSession) {
        //   navigation.replace("Main");
        // } else {
        //   navigation.replace("Setup");
        // }
        navigation.replace("Main");
      } else if (authResult.success && !authResult.hasCompleteSession) {
        navigation.replace("Setup");
      } else {
        navigation.replace("Login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      navigation.replace("Login");
    }
  };

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
