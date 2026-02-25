import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetBaysListForALS,
  useGetDriverListForALS,
  useGetGodownsListForALS,
  useGetRouteListForALS,
  useGetTeamsListForALS,
  useGetVehicleListForALS,
  useOutwadesAlsSubmit,
} from "../../../hooks/useApiQueries";
import { useAuthStore } from "../../../stores/authStore";
import { useCurrentTheme } from "../../../stores/themeStore";
import BottomActionBar from "../../components/BottomActionBar";
import { Button } from "../../components/Button";
import FullWidthSearchSelectInput from "../../components/FullWidthSearchSelectInput";
import FullWidthSelectInput from "../../components/FullWidthSelectInput";
import { ScanToast } from "../../components/ScanToast";
export default function OutWadesDirectALS() {
  const { sessionData } = useAuthStore();
  const theme = useCurrentTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const branchCode = sessionData?.branchCode;
  const userId = sessionData?.userId;
  const finCode = sessionData?.finCode;
  const isFocused = useIsFocused();

  const [loadType, setLoadType] = useState("SUNDRY");
  const [vehicleNo, setVehicleNo] = useState(null);
  const [driverName, setDriverName] = useState(null);
  const [teamsName, setTeamsName] = useState(null);
  const [baysName, setBaysName] = useState(null);
  const [routeName, setRouteName] = useState(null);
  const [godownsName, setGodownsName] = useState(null);
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });
  const { data: vehicleData, isLoading: vehicleLoading, isError: vehicleError } = useGetVehicleListForALS(branchCode);
  const { data: driverData, isLoading: driverLoading, isError: driverError } = useGetDriverListForALS(branchCode);
  const { data: teamsData, isLoading: teamsLoading, isError: teamsError } = useGetTeamsListForALS();
  const { data: baysData, isLoading: baysLoading, isError: baysError } = useGetBaysListForALS();
  const { data: routeData, isLoading: routeLoading, isError: routeError } = useGetRouteListForALS();
  const { data: godownsData, isLoading: godownsLoading, isError: godownsError } = useGetGodownsListForALS();
  const submitALSMutation = useOutwadesAlsSubmit();
  useEffect(() => {
    if (!isFocused) {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }
  }, [isFocused]);

  // Memoize vehicle items mapping
  const vehicleItems = useMemo(() => {
    if (!vehicleData || !Array.isArray(vehicleData)) return [];
    return vehicleData
      .filter((vehicle) => vehicle.vehid != null && vehicle.regno)
      .map((vehicle) => ({
        label: vehicle.regno,
        value: vehicle.regno.toString(),
      }));
  }, [vehicleData]);

  // Memoize driver items mapping
  const driverItems = useMemo(() => {
    if (!driverData || !Array.isArray(driverData)) return [];
    return driverData
      .filter((driver) => driver.did != null && driver.drivername)
      .map((driver) => ({
        label: driver.drivername,
        value: driver.drivername.toString(),
      }));
  }, [driverData]);

  const teamsItems = useMemo(() => {
    if (!teamsData || !Array.isArray(teamsData)) return [];
    return teamsData
      .filter((team) => team.team_ID != null)
      .map((team) => ({
        label: team.team_Code,
        value: team.team_ID,
      }));
  }, [teamsData]);

  const baysItems = useMemo(() => {
    if (!baysData || !Array.isArray(baysData)) return [];
    return baysData
      .filter((bay) => bay.code != null && bay.details)
      .map((bay) => ({
        label: bay.code,
        value: bay.details.toString(),
      }));
  }, [baysData]);

  const routeItems = useMemo(() => {
    if (!routeData || !Array.isArray(routeData)) return [];
    return routeData
      .filter((route) => route.routeDtls != null)
      .map((route) => ({
        label: route.routeDtls,
        value: route.routeDtls.toString(),
      }));
  }, [routeData]);

  const godownsItems = useMemo(() => {
    if (!godownsData || !Array.isArray(godownsData)) return [];
    return godownsData
      .filter((godown) => godown.details != null)
      .map((godown) => ({
        label: godown.details,
        value: godown.details.toString(),
      }));
  }, [godownsData]);

  const loadTypeOptions = [
    { label: "SUNDRY", value: "SUNDRY" },
    { label: "FTL", value: "FTL" },
  ];

  const isLoadingData = vehicleLoading || driverLoading || teamsLoading || baysLoading || routeLoading || godownsLoading;
  const disableProcceed = [vehicleNo, driverName, baysName, teamsName, godownsName, routeName].some((value) => value == null);

  function getDate() {
    const today = new Date();
    const date = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${date}-${month}-${year}`;
  }

  // Get selected driver's contact number
  const selectedDriver = driverData?.find((driver) => driver.drivername.toString() === driverName);
  const driverContactNo = selectedDriver?.contactno || null;

  function onHandleProcceed() {
    if (!driverName || !vehicleNo || !teamsName || !baysName || !routeName) {
      //   alert("Please fill all the fields before proceeding.");
      setToastConfig({
        visible: true,
        type: "warning",
        title: "Remainder",
        message: "Please fill all the fields before proceeding.",
      });
      return;
    }

    function getDate() {
      const today = new Date();
      const date = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return `${year}-${month}-${date}`;
    }
    const now = new Date();
    const time1 = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const payload = {
      date1: getDate(),
      time1: time1,
      loadType,
      vehicle: vehicleNo,
      driver: driverName,
      teamID: teamsName,
      godown: godownsName,
      capacity: 0,
      finCode: finCode,
      branchCode,
      entryUser: sessionData?.userName,
      bay: baysName,
      routeDetails: routeName,
      plsno: 0,
      entryUser: userId,
      directScan: true,
    };

    const submitData = {
      actualLoadSheets: [payload],
    };

    console.log("Actual Load Sheets to be submitted:", submitData);
    submitALSMutation.mutate(submitData, {
      onSuccess: (data) => {
        console.log("ALS submission successful:", data);
        setToastConfig({
          visible: true,
          type: "success",
          title: "Success",
          message: data.status.message || "ALS submitted successfully.",
        });
        setTimeout(() => {
          navigation.navigate("OutWadesScanning", {
            altId: data.dataValue.insertedIds[0],
            isDirect: true,
          });
        }, 600);
      },
      onError: (error) => {
        console.error("Error submitting ALS:", error);
        setToastConfig({
          visible: true,
          type: "error",
          title: "Error",
          message: "Failed to submit ALS. Please try again.",
        });
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "OutwardsList" }],
          });
        }, 1500);
      },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.appBg }} edges={["left", "right"]}>
      <View
        style={{
          flex: 1,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          backgroundColor: theme.colors.appBg,
        }}
      >
        <ScanToast
          visible={toastConfig.visible}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onHide={() => setToastConfig({ ...toastConfig, visible: false })}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled={true}>
            <View className="px-4 py-3">
              <View className="bg-white rounded-2xl p-3 shadow-lg">
                <Text className="text-xl font-bold mb-3" style={{ color: theme.colors.headingText }}>
                  ALS Details
                </Text>

                <View className="flex-row mb-2">
                  <View className="flex-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      PLS NO
                    </Text>
                    <Text className="font-bold text-base" style={{ color: theme.colors.inputText }}>
                      {0}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      DATE
                    </Text>
                    <Text className="font-semibold text-sm" style={{ color: theme.colors.inputText }}>
                      {getDate()}
                    </Text>
                  </View>
                </View>

                <View className="flex-row mb-2">
                  <View className="flex-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      ROUTE
                    </Text>
                    <Text className="font-semibold text-sm" style={{ color: theme.colors.inputText }}>
                      {"selected Route"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap mb-3">
                  <View className="w-1/2 mb-2 pr-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      DOCKETS
                    </Text>
                    <Text className="font-bold text-base" style={{ color: theme.colors.inputText }}>
                      {0}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-2 pl-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      PACKETS
                    </Text>
                    <Text className="font-bold text-base" style={{ color: theme.colors.inputText }}>
                      {0}
                    </Text>
                  </View>
                  <View className="w-1/2 pr-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      WEIGHT
                    </Text>
                    <Text className="font-bold text-base" style={{ color: theme.colors.inputText }}>
                      {0} kg
                    </Text>
                  </View>
                  <View className="w-1/2 pl-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      CFT
                    </Text>
                    <Text className="font-bold text-base" style={{ color: theme.colors.inputText }}>
                      {0}
                    </Text>
                  </View>
                </View>

                {/* Loading Overlay */}
                {isLoadingData && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.3)",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 12,
                      zIndex: 9999,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        paddingVertical: 20,
                        paddingHorizontal: 30,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                    >
                      <ActivityIndicator size="large" color={theme.colors.primary} />
                      <Text
                        style={{
                          marginTop: 10,
                          fontSize: 14,
                          color: theme.colors.bodyText,
                          fontWeight: "500",
                        }}
                      >
                        Loading vehicles, drivers, teams, bays, and routes...
                      </Text>
                    </View>
                  </View>
                )}

                <View className="mb-1" style={{ zIndex: 2000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSelectInput
                    label="LOAD TYPE"
                    value={loadType}
                    onChange={setLoadType}
                    items={loadTypeOptions}
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>

                <View className="mb-1" style={{ zIndex: 1000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSearchSelectInput
                    label="VEHICLE NO"
                    value={vehicleNo}
                    onChange={setVehicleNo}
                    items={vehicleItems}
                    placeholderText="Select vehicle"
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>

                <View className="mb-1" style={{ zIndex: 1000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSearchSelectInput
                    label="DRIVER NAME"
                    value={driverName}
                    onChange={setDriverName}
                    items={driverItems}
                    placeholderText="Select driver"
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>
                {driverContactNo && (
                  <View className="w-1/2 pl-1">
                    <Text className="text-xs" style={{ color: theme.colors.inputText }}>
                      DRIVER CONTACT NUMBER
                    </Text>
                    <Text className="font-bold text-base" style={{ color: theme.colors.inputText }}>
                      {driverContactNo || 0}
                    </Text>
                  </View>
                )}

                <View className="mb-1" style={{ zIndex: 1000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSearchSelectInput
                    label="TEAM NAME"
                    value={teamsName}
                    onChange={setTeamsName}
                    items={teamsItems}
                    placeholderText="Select team"
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>

                <View className="mb-1" style={{ zIndex: 1000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSearchSelectInput
                    label="BAY NAME"
                    value={baysName}
                    onChange={setBaysName}
                    items={baysItems}
                    placeholderText="Select bay"
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>
                <View className="mb-1" style={{ zIndex: 1000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSearchSelectInput
                    label="ROUTE NAME"
                    value={routeName}
                    onChange={setRouteName}
                    items={routeItems}
                    placeholderText="Select route"
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>

                <View className="mb-1" style={{ zIndex: 1000, opacity: isLoadingData ? 0.5 : 1 }}>
                  <FullWidthSearchSelectInput
                    label="GODOWN NAME"
                    value={godownsName}
                    onChange={setGodownsName}
                    items={godownsItems}
                    placeholderText="Select godown"
                    labelFontSize={13}
                    labelFontWeight="400"
                    labelLineHeight={20}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <BottomActionBar includeBottomInset={false}>
          <View className="flex-row gap-3">
            <Button variant="secondary" size="lg" onPress={() => navigation.goBack()} className="flex-1">
              Back
            </Button>
            <Button variant="primary" size="lg" className="flex-1" onPress={onHandleProcceed} disabled={disableProcceed}>
              Proceed
            </Button>
          </View>
        </BottomActionBar>
      </View>
    </SafeAreaView>
  );
}
