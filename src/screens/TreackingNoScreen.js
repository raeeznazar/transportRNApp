import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTheme } from "../../stores/themeStore";
import { Button } from "../components/Button";

export default function TreackingNoScreen() {
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [docketNumber, setDocketNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleViewDetails = async () => {
    if (!docketNumber.trim()) {
      alert("Please enter a docket number");
      return;
    }
    setLoading(true);
    try {
      // Add your API call here to validate docket
      setTimeout(() => {
        setLoading(false);
        // Navigate to details screen with docket number
        navigation.navigate("DocketDetails", { docketNumber: docketNumber.trim() });
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert("Error loading docket details");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* Main Content */}
      <View style={styles.mainContent}>
        <View style={styles.formContainer}>
          {/* Docket Number Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.heading }]}>TYPE DOCKET</Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: theme.colors.inputBorder,
                  backgroundColor: theme.colors.card,
                },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Enter Docket Number"
                placeholderTextColor={theme.colors.placeholder}
                value={docketNumber}
                onChangeText={setDocketNumber}
                editable={!loading}
              />
              <Ionicons name="search" size={24} color={theme.colors.inputBorder} />
            </View>
          </View>

          {/* View Details Button */}
          <Button variant="primary" size="md" onPress={handleViewDetails} disabled={loading} loading={loading}>
            View Details
          </Button>
        </View>

        {/* Helper Text */}
        <View style={styles.helperContainer}>
          <Text style={[styles.helperText, { color: theme.colors.placeholder }]}>
            Please enter the unique docket number provided in your dispatch notice.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    borderBottomWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 64,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "500",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  helperContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  helperText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
