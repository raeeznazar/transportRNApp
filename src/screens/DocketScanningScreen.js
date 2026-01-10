import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, ImageBackground, Modal, ScrollView, Text, TextInput, TouchableOpacity, Vibration, View } from "react-native";
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
  const [isDamage, setIsDamage] = useState(false);
  const { thcid } = route.params;

  // Damage modal state
  const [showDamageModal, setShowDamageModal] = useState(true);
  const [damageReason, setDamageReason] = useState("");
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [currentScannedBarcode, setCurrentScannedBarcode] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  // Take photo using camera
  const takePhoto = async () => {
    if (damagePhotos.length >= 4) {
      Toast.show({
        type: "error",
        text1: "Photo Limit Reached",
        text2: "Maximum 4 photos allowed",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDamagePhotos([...damagePhotos, result.assets[0].uri]);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Camera Error",
        text2: "Failed to take photo",
        position: "top",
        visibilityTime: 2000,
      });
    }
  };

  // Delete photo
  const deletePhoto = (index) => {
    setDamagePhotos(damagePhotos.filter((_, i) => i !== index));
    setSelectedPhoto(null);
  };

  // Handle damage modal save
  const handleDamageSave = () => {
    if (!damageReason.trim()) {
      Toast.show({
        type: "error",
        text1: "Reason Required",
        text2: "Please enter a reason for damage",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    if (damagePhotos.length === 0) {
      Toast.show({
        type: "error",
        text1: "Photo Required",
        text2: "Please take at least one photo",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    // Submit damage data to API
    insertScanningData.mutate(
      {
        thcid: thcid,
        branchCode: sessionData?.branchCode,
        barcode: currentScannedBarcode,
        isDamage: true,
        reason: damageReason,
        photos: damagePhotos,
      },
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Damage Recorded",
            text2: "Damage scan saved successfully",
            position: "top",
            visibilityTime: 3000,
          });
          closeDamageModal();
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Save Failed",
            text2: error.message || "Failed to save damage record",
            position: "top",
            visibilityTime: 3000,
          });
        },
      }
    );
  };

  // Close modal and reset
  const closeDamageModal = () => {
    setShowDamageModal(false);
    setDamageReason("");
    setDamagePhotos([]);
    setCurrentScannedBarcode(null);
    setSelectedPhoto(null);
  };

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

        if (isDamage) {
          // Show damage modal
          setCurrentScannedBarcode(scannedValue);
          setShowDamageModal(true);
        } else {
          // Regular scan - send to API
          insertScanningData.mutate(
            {
              thcid: thcid,
              branchCode: sessionData?.branchCode,
              barcode: scannedValue,
              isDamage: false,
            },
            {
              onSuccess: () => {
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
        }
      } catch (e) {
        console.warn("Scan handling error:", e);
      } finally {
        setScanningEnabled(false);
        setTimeout(() => setScanningEnabled(true), 2000);
      }
    },
    [scanningEnabled, scannedDockets, thcid, sessionData?.branchCode, insertScanningData, isDamage]
  );

  // Sample data
  // Transform API data to match component structure
  const dockets =
    docketScanData?.map((item) => ({
      id: item.docketid,
      number: item.docketno,
      total: item.totalPackets,
      scanned: item.scanned,
      short: item.totalPackets - item.scanned,
      completed: item.scanned === item.totalPackets,
    })) || [];

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
                      navigation.navigate("DocketDamagePacketsAdd", { docketID: docket.id, thcid: thcid });
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
      <View className="flex-1 rounded-t-[32px]" style={{ backgroundColor: theme.colors.appBg }}>
        {/* Header */}
        <View
          className="px-6 pt-3 pb-3 flex-row items-center justify-between"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#CBD5E1" + "30",
            backgroundColor: isDamage ? "#fef2f2" : "transparent",
          }}
        >
          <View>
            <Text className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              Dockets
            </Text>
            <Text className="text-xs font-semibold mt-0.5" style={{ color: theme.colors.secondaryText, opacity: 0.6 }}>
              {dockets.length} Items
            </Text>
          </View>

          {/* Toggle Switch */}
          <View
            className="flex-row rounded-full p-0.5"
            style={{
              backgroundColor: theme.colors.cardBg,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <TouchableOpacity
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: !isDamage ? theme.colors.primary : "transparent",
                shadowColor: !isDamage ? theme.colors.primary : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
                elevation: !isDamage ? 2 : 0,
              }}
              onPress={() => setIsDamage(false)}
              activeOpacity={0.8}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: !isDamage ? "#fff" : theme.colors.secondaryText,
                }}
              >
                Regular
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: isDamage ? "#fee2e2" : "transparent",
                shadowColor: isDamage ? "#ef4444" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: isDamage ? 2 : 0,
              }}
              onPress={() => setIsDamage(true)}
              activeOpacity={0.8}
            >
              <Text
                className="text-xs font-bold"
                style={{
                  color: isDamage ? "#dc2626" : theme.colors.secondaryText,
                }}
              >
                Damage
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dockets List */}
        <ScrollView
          className="flex-1 px-4 py-4"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: isDamage ? "#fef2f2" : "transparent",
          }}
        >
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

      {/* Damage Modal */}
      <Modal visible={showDamageModal} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="rounded-t-3xl p-6"
            style={{
              backgroundColor: theme.colors.cardBg,
              maxHeight: "90%",
              paddingBottom: insets.bottom + 24,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold" style={{ color: theme.colors.text }}>
                Damage Details
              </Text>
              <TouchableOpacity onPress={closeDamageModal}>
                <Ionicons name="close-circle" size={28} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Barcode Info */}
              <View
                className="mb-4 p-3 rounded-lg"
                style={{
                  backgroundColor: theme.colors.primary + "10",
                  borderWidth: 1,
                  borderColor: theme.colors.primary + "30",
                }}
              >
                <Text className="text-xs font-semibold mb-1" style={{ color: theme.colors.secondaryText }}>
                  Scanned Barcode
                </Text>
                <Text className="text-base font-bold" style={{ color: theme.colors.text }}>
                  {currentScannedBarcode}
                </Text>
              </View>

              {/* Reason Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold mb-2" style={{ color: theme.colors.text }}>
                  Reason for Damage *
                </Text>
                <TextInput
                  className="rounded-lg p-3 text-base"
                  style={{
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  placeholder="Enter damage reason..."
                  placeholderTextColor={theme.colors.secondaryText}
                  value={damageReason}
                  onChangeText={setDamageReason}
                  multiline
                />
              </View>

              {/* Photos Section */}
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
                    Photos * ({damagePhotos.length}/4)
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center gap-2 px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: theme.colors.primary,
                      opacity: damagePhotos.length >= 4 ? 0.5 : 1,
                    }}
                    onPress={takePhoto}
                    disabled={damagePhotos.length >= 4}
                  >
                    <Ionicons name="camera" size={18} color="#fff" />
                    <Text className="text-xs font-bold text-white">Take Photo</Text>
                  </TouchableOpacity>
                </View>

                {/* Photo Grid */}
                <View className="flex-row flex-wrap gap-2">
                  {damagePhotos.map((photo, index) => (
                    <TouchableOpacity
                      key={index}
                      className="relative rounded-lg overflow-hidden"
                      style={{
                        width: "48%",
                        aspectRatio: 4 / 3,
                        backgroundColor: theme.colors.background,
                      }}
                      onPress={() => setSelectedPhoto(photo)}
                    >
                      <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                      <TouchableOpacity
                        className="absolute top-2 right-2 rounded-full p-1"
                        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                        onPress={() => deletePhoto(index)}
                      >
                        <Ionicons name="trash" size={16} color="#fff" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: theme.colors.background,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                  }}
                  onPress={closeDamageModal}
                >
                  <Text className="font-bold" style={{ color: theme.colors.secondaryText }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center justify-center"
                  style={{ backgroundColor: theme.colors.primary }}
                  onPress={handleDamageSave}
                >
                  <Text className="font-bold text-white">Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Photo Preview Modal */}
      <Modal visible={selectedPhoto !== null} transparent animationType="fade">
        <View className="flex-1 bg-black">
          <TouchableOpacity className="absolute top-12 right-6 z-10" onPress={() => setSelectedPhoto(null)}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          {selectedPhoto && <Image source={{ uri: selectedPhoto }} className="w-full h-full" resizeMode="contain" />}
        </View>
      </Modal>
    </View>
  );
}
