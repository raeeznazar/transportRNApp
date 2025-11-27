import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { AuthService } from "../../services/authService";
import { SecureStoreService } from "../../services/keychainService";
import FullWidthSelectInput from "../components/FullWidthSelectInput";

export default function SetupScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { user } = route.params || {};
  const [type, setType] = useState("CO"); // Default to "CO"
  const [branches, setBranch] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState();
  const [year, setYear] = useState([]);
  const [selectedYear, setSelectedYear] = useState();
  const [companyCode, setCompanyCode] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCompanies(type);
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStoreService.clearCredentials();
      navigation.navigate("Login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  function handleTypeChange(selectedType) {
    setType(selectedType);
    getCompanies(selectedType);
  }

  const getCompanies = async (selectedType) => {
    try {
      const result = await AuthService.getCompanies(selectedType);
      if (result.success) {
        const branchesData = result.data.map((comp) => ({ label: comp.branchName, value: comp.branchCode, companyCode: comp.companyCode }));
        setBranch(branchesData);
        if (branchesData.length > 0) {
          setSelectedBranch(branchesData[0].value);
          handleBranchChange(branchesData[0].value, branchesData);
        }
      }
    } catch (error) {
      console.error("Get companies error:", error);
    } finally {
      setLoading(false);
      console.log("Get companies API call completed.", branch);
    }
  };

  function handleBranchChange(branchCode, branchesArray = null) {
    setSelectedBranch(branchCode);
    const branchList = branchesArray && branchesArray.length > 0 ? branchesArray : branches;
    const branch = branchList.find((item) => item.value === branchCode);
    const companyCode = branch ? branch.companyCode : null;
    setCompanyCode(companyCode);
    if (companyCode && branchCode) {
      getFinancialYears(branchCode, companyCode);
    }
  }

  async function getFinancialYears(selectedBranch, companyCode) {
    try {
      const result = await AuthService.getFinancialYears(selectedBranch, companyCode);
      if (result.success) {
        const yearsData = result.data.map((year) => ({ label: year.finYear, value: year.finCode }));
        setYear(yearsData);
        if (yearsData.length > 0) {
          setSelectedYear(yearsData[0].value);
        }
      }
    } catch (error) {
      console.error("Get companies error:", error);
    } finally {
      setLoading(false);
      console.log("Get companies API call completed.", branch);
    }
  }

  function handleYearChange(yearCode) {
    setSelectedYear(yearCode);
  }

  const proceed = () => {
    if (!selectedBranch || !selectedYear || !type) {
      Alert.alert("Incomplete", "Please select all fields.");
      return;
    }
    proceedToDashboard();
  };

  const proceedToDashboard = async () => {
    console.log("Proceeding to dashboard with:", { selectedBranch, companyCode, selectedYear });
    setLoading(true);
    const result = await AuthService.dashBoardProced(companyCode, selectedBranch, selectedYear);

    if (result.success) {
      setLoading(false);
      navigation.replace("Main", {
        filters: { branch: selectedBranch, corporate: type, year: selectedYear, user },
      });
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <View
      className="flex-1 justify-center p-5 bg-primaryBg"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View style={styles.container}>
        <Text style={styles.header}>Setup</Text>
        <Text style={styles.sub}>Logged in as: {user || "User"}</Text>

        <FullWidthSelectInput
          label="Type"
          value={type}
          onChange={handleTypeChange}
          items={[
            { label: "Corporate", value: "CO" },
            { label: "Branch", value: "BO" },
            { label: "Region", value: "ZO" },
          ]}
        />

        <FullWidthSelectInput label="Branch" value={selectedBranch} onChange={handleBranchChange} items={branches} />
        <FullWidthSelectInput label="Financial Year" value={selectedYear} onChange={handleYearChange} items={year} />
        <TouchableOpacity
          className="p-2 rounded-lg items-center bg-buttonBackground"
          onPress={proceed}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.buttonText} />
          ) : (
            <Text className="font-bold text-base text-buttonText">Proceed to Dashboard</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity className="p-2 rounded-lg items-center bg-buttonBackground" onPress={handleLogout}>
          <Text className="font-bold text-base text-buttonText">Login with different account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 8 },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 4, color: theme.colors.textSecondary },
  sub: { marginBottom: 12, color: "#666" },
});
