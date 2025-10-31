import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { theme } from "../../constants/theme";
import { AuthService } from "../../services/authService";

export default function LoginScreen({ navigation }) {
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
    <View className="flex-1 justify-center p-5 bg-primaryBg">
      <Image source={require("../../assets/images/icon.png")} style={styles.logo} resizeMode="contain" />
      <Text className="text-3xl font-semibold text-center mb-6">Welcome</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!loading}
        className="border bg-inputBackground border-borderLight text-inputText rounded-lg p-3 pr-12 mb-4"
        placeholderTextColor={theme.colors.textSecondary}
      />

      <View className="relative mb-4">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          editable={!loading}
          className="border bg-inputBackground border-borderLight text-inputText rounded-lg p-3 pr-12"
          placeholderTextColor={theme.colors.textSecondary}
        />
        <TouchableOpacity className="absolute right-3 top-1/2 -translate-y-1/2" onPress={() => setShowPassword(!showPassword)} disabled={loading}>
          {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="p-2 rounded-lg items-center bg-buttonBackground"
        onPress={onLogin}
        disabled={loading}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? <ActivityIndicator color={theme.colors.buttonText} /> : <Text className="font-bold text-base text-buttonText">Login</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: "60%",
    maxWidth: 160,
    height: 80,
    alignSelf: "center",
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: "center",
    fontSize: 14,
  },
});
