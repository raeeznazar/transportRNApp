import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, ScrollView, Text, TouchableOpacity, Vibration, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useGetDocketScanList, useInsertScanningData } from "../../hooks/useApiQueries";
import { useAuthStore } from "../../stores/authStore";
import { useCurrentTheme } from "../../stores/themeStore";

export default function DocketScanningScreen({ route }) {
  const { sessionData } = useAuthStore();
  const theme = useCurrentTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanningEnabled, setScanningEnabled] = useState(true);
  const { thcid } = route.params;
  // Fetch docket scan list
  const { data: docketScanData, isLoading, isError, error } = useGetDocketScanList(sessionData?.branchCode, thcid);
  const insertScanningData = useInsertScanningData();

  // Animated scanner line
  const scanAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create scanning animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for scanner frame
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLineTranslateY = scanAnimation.interpolate({
    inputRange: [0, 0.1, 0.5, 0.9, 1],
    outputRange: [0, 0, 112, 112, 0], // 0% to 80% of 140 (h-40 height in pixels)
  });

  const scanLineOpacity = scanAnimation.interpolate({
    inputRange: [0, 0.1, 0.5, 0.9, 1],
    outputRange: [0, 0.5, 0.5, 0, 0],
  });

  // Sync permission state and request on first mount if undefined
  useEffect(() => {
    if (!permission) {
      // permission has not been checked yet
      return;
    }
    setHasCameraPermission(permission.granted);
  }, [permission, requestPermission]);

  const [scannedDockets, setScannedDockets] = useState(new Set());

  // Scan handler — only accepts Code128 barcodes with 13 digits
  const handleBarCodeScanned = useCallback(
    ({ type, data }) => {
      if (!scanningEnabled) return;

      // Only accept Code128 barcodes
      if (type !== "code128") {
        return;
      }

      // Normalize the scanned data
      const scannedValue = String(data).trim();

      // Validate: must be exactly 13 digits (numeric only)
      const isValidFormat = /^\d{13}$/.test(scannedValue);
      if (!isValidFormat) {
        return;
      }

      // Check if already scanned
      if (scannedDockets.has(scannedValue)) {
        return;
      }
      try {
        Vibration.vibrate([0, 100, 50, 100]);

        // Mark as scanned
        setScannedDockets((prev) => new Set(prev).add(scannedValue));

        // Send to API with minimal payload
        insertScanningData.mutate(
          {
            thcid: thcid,
            branchCode: sessionData?.branchCode,
            barcode: scannedValue,
          },
          {
            onSuccess: (response) => {
              Toast.show({
                type: "success",
                text1: "Scan Successful",
                text2: "Scan data sent successfully",
                position: "top",
                visibilityTime: 3000,
              });
            },
            onError: (error) => {
              Toast.show({
                type: "error",
                text1: "Scan Failed",
                text2: error.message || "Failed to send scan data",
                position: "top",
                visibilityTime: 3000,
              });

              // Remove from scanned set if API fails
              setScannedDockets((prev) => {
                const updated = new Set(prev);
                updated.delete(scannedValue);
                return updated;
              });
            },
          }
        );
      } catch (e) {
        console.warn("Scan handling error:", e);
      } finally {
        setScanningEnabled(false);
        setTimeout(() => setScanningEnabled(true), 2000);
      }
    },
    [scanningEnabled, scannedDockets, thcid, sessionData?.branchCode, insertScanningData]
  );

  // Sample data
  // Transform API data to match component structure
  const dockets = (docketScanData || [])
    .filter((item) => item.scanned !== item.totalPackets) // hide completed
    .map((item) => ({
      id: item.docketid,
      number: item.docketno,
      total: item.totalPackets,
      scanned: item.scanned,
      short: item.totalPackets - item.scanned,
      completed: item.scanned === item.totalPackets,
    }));

  const DocketCard = ({ docket }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          <View
            className="mb-4 rounded-2xl p-5"
            style={{
              backgroundColor: theme.colors.cardBg,
              borderWidth: 1,
              borderColor: "#CBD5E1" + "30",
              shadowColor: "#d9d4d4ff",
              shadowOpacity: 0.04,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Docket Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text
                  className="text-[11px] font-semibold uppercase mb-1.5"
                  style={{
                    color: theme.colors.secondaryText,
                    letterSpacing: 0.8,
                    opacity: 0.6,
                  }}
                >
                  Docket No
                </Text>
                <Text
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: docket.completed ? theme.colors.secondaryText : theme.colors.text }}
                >
                  #{docket.number}
                </Text>
              </View>
              {docket.completed && (
                <View
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: theme.colors.success + "10",
                    borderWidth: 1,
                    borderColor: theme.colors.success + "30",
                  }}
                >
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text className="text-[10px] font-bold uppercase" style={{ color: theme.colors.success, letterSpacing: 0.8 }}>
                    Completed
                  </Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View
              className="flex-row pt-4"
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.border + "30",
                opacity: docket.completed ? 0.75 : 1,
              }}
            >
              <View className="flex-1 pr-3">
                <Text
                  className="text-[10px] uppercase font-bold mb-2"
                  style={{
                    color: theme.colors.secondaryText,
                    letterSpacing: 0.8,
                    opacity: 0.6,
                  }}
                >
                  Total Packets
                </Text>
                <Text className="text-lg font-semibold" style={{ color: docket.completed ? theme.colors.secondaryText : theme.colors.text }}>
                  {docket.total}
                </Text>
              </View>

              <View className="flex-1 px-3">
                <Text
                  className="text-[10px] uppercase font-bold mb-2"
                  style={{
                    color: theme.colors.secondaryText,
                    letterSpacing: 0.8,
                    opacity: 0.6,
                  }}
                >
                  Scanned
                </Text>
                <Text
                  className="text-lg font-bold"
                  style={{
                    color: docket.scanned > 0 ? theme.colors.primary : (theme.colors.secondaryText || "#475569") + "60",
                  }}
                >
                  {docket.scanned}
                </Text>
              </View>

              <View className="flex-1 pl-3">
                <Text
                  className="text-[10px] uppercase font-bold mb-2"
                  style={{
                    color: theme.colors.secondaryText,
                    letterSpacing: 0.8,
                    opacity: 0.6,
                  }}
                >
                  short
                </Text>
                <TouchableOpacity
                  disabled={docket.short === 0}
                  onPress={() => {
                    if (docket.short > 0) {
                      navigation.navigate("DocketMissingPacketsAdd", { docketID: docket.id, thcid: thcid });
                    }
                  }}
                  activeOpacity={docket.short > 0 ? 0.7 : 1}
                >
                  <Text
                    className="text-lg font-semibold"
                    style={{
                      color: docket.completed ? theme.colors.secondaryText : theme.colors.text,
                      textDecorationLine: docket.short > 0 ? "underline" : "none",
                    }}
                  >
                    {docket.short}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }

  // Show error state
  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.colors.background }}>
        <Text className="text-center" style={{ color: theme.colors.error }}>
          {error?.message || "Failed to load docket scan list"}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      {/* Camera View with Background */}
      <View className="relative h-[28vh]" style={{ backgroundColor: "#000", zIndex: 1 }}>
        {/* Camera/Background Layer */}
        {hasCameraPermission === true ? (
          <CameraView
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["code128"], // Only scan Code128
            }}
            onBarcodeScanned={scanningEnabled ? handleBarCodeScanned : undefined}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
        ) : (
          <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=800" }}
            className="absolute inset-0"
            style={{ opacity: 0.8 }}
            resizeMode="cover"
          />
        )}

        {/* Header */}
        <View className="absolute top-0 left-0 w-full z-20 flex-row items-center justify-between px-6 py-4" style={{ paddingTop: insets.top }}>
          <View className="w-10" />

          <TouchableOpacity
            activeOpacity={0.8}
            className="rounded-full p-2"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            }}
            onPress={() => setFlashEnabled(!flashEnabled)}
          >
            <Ionicons name={flashEnabled ? "flash" : "flash-off"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanner Frame */}
        <View className="absolute inset-0 items-center justify-center z-10">
          <Animated.View
            style={{
              transform: [{ scale: pulseAnimation }],
            }}
          >
            <View
              className="relative w-64 h-40 rounded-lg overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              {/* Corner borders */}
              <View className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
              <View className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
              <View className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
              <View className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/80 rounded-br-lg" />

              {/* Animated Scan Line */}
              <Animated.View
                className="absolute left-[5%] w-[90%] h-[1px]"
                style={{
                  backgroundColor: "#10b981",
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  transform: [{ translateY: scanLineTranslateY }],
                  opacity: scanLineOpacity,
                }}
              />
            </View>
          </Animated.View>

          <Text className="mt-4 text-white/80 text-xs font-medium tracking-wide">Align barcode within frame</Text>
        </View>
      </View>

      {/* Content Section */}
      <View
        className="flex-1 rounded-t-[32px]"
        style={{
          backgroundColor: theme.colors.appBg,
        }}
      >
        {/* Header */}
        <View
          className="px-6 pt-3 pb-3 flex-row items-center justify-between"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#CBD5E1" + "30",
          }}
        >
          <View>
            <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              Dockets
            </Text>
          </View>
          <Text className="text-xs font-semibold" style={{ color: theme.colors.secondaryText, opacity: 0.6 }}>
            {dockets.length} Items
          </Text>
        </View>

        {/* Dockets List */}
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          {dockets.map((docket) => (
            <DocketCard key={docket.id} docket={docket} />
          ))}

          {/* Finish Button */}
          <View className="px-2 pt-4" style={{ paddingBottom: insets.bottom + 24 }}>
            <TouchableOpacity
              className="w-full h-16 rounded-2xl flex-row items-center justify-center gap-3"
              style={{
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 24,
                elevation: 10,
              }}
              activeOpacity={0.95}
              onPress={() => navigation.navigate("DocketScanSummaryScreen", { thcid: thcid })}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text className="text-white font-bold text-lg tracking-wide">Finish Scanning</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
