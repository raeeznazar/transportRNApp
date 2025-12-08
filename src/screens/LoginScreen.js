import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AuthService } from "../../services/authService";
import { useCurrentTheme } from "../../stores/themeStore";

export default function LoginScreen({ navigation }) {
  const theme = useCurrentTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.login(username, password);
      if (result.success) {
        // Navigate to main app
        navigation.navigate("Setup");
      } else {
        setError(result.error);
      }
      // navigation.navigate("Setup");
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[LoginStyles.scrollViewContainer, { backgroundColor: theme.colors.appBg }]}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === "ios" ? 20 : 10}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex-1 items-center justify-center px-6 py-6" style={{ backgroundColor: theme.colors.appBg }}>
        <View className="w-full max-w-md">
          {/* Logo/Header Section */}
          <View className="flex-col items-center w-full pb-8 pt-6">
            <View
              className="items-center justify-center h-20 w-20 rounded-full mb-4"
              style={{ backgroundColor: `${theme.colors.buttonPrimaryBg}33` }}
            >
              <MaterialIcons name="local-shipping" size={48} color={theme.colors.buttonPrimaryBg} />
            </View>
            <Text className="text-[32px] font-bold leading-tight text-center tracking-tight" style={{ color: theme.colors.headingText }}>
              Welcome Back
            </Text>
            <Text className="text-base font-normal leading-normal text-center pt-1" style={{ color: theme.colors.bodyText }}>
              Sign in to continue your deliveries
            </Text>
          </View>

          {/* Error Message */}
          {error ? <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text> : null}

          {/* Form Section */}
          <View className="w-full space-y-4">
            {/* Email/Username Field */}
            <View className="flex-col w-full mb-4">
              <Text className="text-base font-medium leading-normal pb-2" style={{ color: theme.colors.bodyText }}>
                Username
              </Text>
              <View className="relative flex w-full">
                <View className="absolute left-4 top-1/2 z-10" style={{ transform: [{ translateY: -12 }] }}>
                  <MaterialIcons name="mail" size={24} color={theme.colors.inputPlaceholder} />
                </View>
                <TextInput
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                  className="w-full rounded-xl border h-18 text-base font-normal leading-normal"
                  style={{
                    paddingLeft: 48,
                    paddingRight: 16,
                    paddingVertical: 15,
                    borderColor: theme.colors.inputBorder,
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.inputText,
                  }}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="flex-col w-full mb-4">
              <Text className="text-base font-medium leading-normal pb-2" style={{ color: theme.colors.bodyText }}>
                Password
              </Text>
              <View className="relative flex w-full">
                <View className="absolute left-4 top-1/2 z-10" style={{ transform: [{ translateY: -12 }] }}>
                  <MaterialIcons name="lock" size={24} color={theme.colors.inputPlaceholder} />
                </View>
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  className="w-full rounded-xl border h-18 text-base font-normal leading-normal"
                  style={{
                    paddingLeft: 48,
                    paddingRight: 48,
                    paddingVertical: 15,
                    borderColor: theme.colors.inputBorder,
                    backgroundColor: theme.colors.inputBg,
                    color: theme.colors.inputText,
                  }}
                  placeholderTextColor={theme.colors.inputPlaceholder}
                />
                <TouchableOpacity
                  className="absolute right-0 top-0 h-full px-4 items-center justify-center"
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <Eye size={20} color={theme.colors.inputPlaceholder} />
                  ) : (
                    <EyeOff size={20} color={theme.colors.inputPlaceholder} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Section */}
          <View className="w-full pt-8 pb-4">
            <TouchableOpacity
              className="w-full rounded-xl h-14 px-5 items-center justify-center"
              style={{ backgroundColor: theme.colors.buttonPrimaryBg, opacity: loading ? 0.7 : 1 }}
              onPress={onLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.buttonPrimaryText} />
              ) : (
                <Text className="text-base font-bold leading-normal text-white tracking-wide">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          {/* <View className="flex w-full items-center py-2">
            <TouchableOpacity>
              <Text className="text-sm font-semibold leading-normal" style={{ color: theme.colors.buttonPrimaryBg }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </View> */}

          {/* Footer Section */}
          {/* <View className="w-full border-t mt-6 pt-6 items-center" style={{ borderTopColor: theme.colors.cardBorder }}>
            <Text className="text-sm text-bodyText">
              Don't have an account?{" "}
              <Text className="font-bold" style={{ color: theme.colors.buttonPrimaryBg }}>
                Sign Up
              </Text>
            </Text>
          </View> */}
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});

const LoginStyles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
});
