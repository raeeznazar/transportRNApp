import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetTrackingDocketDetails } from "../../hooks/useApiQueries";
import { useCurrentTheme } from "../../stores/themeStore";
export default function TrackingDocketDetailsScreen({ route }) {
  const { params = {} } = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useCurrentTheme();
  const [showAlert, setShowAlert] = useState(false);

  const { docket_Number } = route.params;
  const { data, isLoading, isError, error, refetch } = useGetTrackingDocketDetails(docket_Number);
  console.log("TrackingDocketDetailsScreen params:", data);
  // Handle error - show alert
  useEffect(() => {
    if (isError) {
      Alert.alert(
        "Not Found",
        `Docket ${docket_Number} not found`,
        [
          {
            text: "Go Back",
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    }
  }, [isError, navigation, docket_Number]);

  const {
    docketNumber = data?.docketNo,
    docketDate = data?.docketDate,
    primaryRoute = data?.fromStation + " → " + data?.toStation,
    sender = { name: data?.consignorName, address: `${data?.consignorAddress1}\n${data?.consignorAddress2}, ${data?.consignorAddress3}` },
    receiver = { name: data?.consigneeName, address: `${data?.consigneeAddress1}\n${data?.consigneeAddress2}, ${data?.consigneeAddress3}` },
    packageDetails = { qty: `${data?.totalPackets}`, weight: `${data?.docketWeight}`, type: `${data?.bookingType}` },
    charges = {
      freight: "$1,240.00",
      handling: "$45.00",
      insurance: "$12.50",
      total: "$1,297.50",
      status: "Paid",
    },
    timeline = [
      { title: "Delivered", time: "10:45 AM", place: "Warehouse B - Receiving Dock 4", date: "Oct 25, 2023", done: true },
      { title: "Out for Delivery", time: "08:15 AM", place: "Transit Terminal Hub", date: "Oct 25, 2023", done: true },
      { title: "Dispatched", time: "04:30 PM", place: "North-East Hub", date: "Oct 24, 2023", done: true },
      { title: "Docket Created", time: "09:00 AM", place: "Central Logistics Office", date: "Oct 24, 2023", done: true },
    ],
  } = params;

  const headerBg = theme.colors.card ?? "#fff";
  const textPrimary = theme.colors.text ?? "#0f172a";

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View className="items-center gap-3">
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
            Loading docket details…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View className="items-center gap-3">
          <Text className="text-sm font-semibold" style={{ color: theme.colors.text }}>
            No Data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.appBg }}>
      {showAlert && <BlurView intensity={100} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} />}
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} scrollEnabled={!showAlert} pointerEvents={showAlert ? "none" : "auto"}>
        {/* General Info */}
        <View className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <View className="p-3 border-b border-slate-100 flex-row items-center justify-between bg-slate-50/50">
            <Text className="font-bold text-[11px] uppercase tracking-wider text-slate-600">General Info</Text>
            <Ionicons name="document-text-outline" size={18} color="#cbd5e1" />
          </View>
          <View className="p-4 space-y-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Docket No</Text>
                <Text className="text-base font-bold text-slate-900">{docketNumber}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</Text>
                <Text className="text-base font-semibold text-slate-900">{docketDate}</Text>
              </View>
            </View>
            <View className="pt-3 border-t border-slate-50">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Route</Text>
              <View className="flex-row items-center gap-3 bg-slate-50 p-3 rounded-lg">
                <Ionicons name="trail-sign-outline" size={20} color={textPrimary} />
                <Text className="text-sm font-semibold text-slate-700">{primaryRoute}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sender & Receiver */}
        <View className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <View className="p-3 border-b border-slate-100 flex-row items-center justify-between bg-slate-50/50">
            <Text className="font-bold text-[11px] uppercase tracking-wider text-slate-600">Sender & Receiver Info</Text>
            <Ionicons name="location-outline" size={18} color="#cbd5e1" />
          </View>
          <View className="p-4 space-y-6">
            {/* Sender */}
            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-500 uppercase">Sender</Text>
                <View className="flex-row gap-4">
                  <Ionicons name="call-outline" size={18} color={textPrimary} />
                  <Ionicons name="mail-outline" size={18} color={textPrimary} />
                </View>
              </View>
              <View>
                <Text className="text-sm font-bold text-slate-900">{sender.name}</Text>
                <Text className="text-xs text-slate-500 mt-1 leading-relaxed">{sender.address}</Text>
              </View>
            </View>

            <View className="border-t border-slate-100" />

            {/* Receiver */}
            <View className="space-y-3 mt-3">
              <View className="flex-row justify-between items-center">
                <Text className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 uppercase">Receiver</Text>
                <View className="flex-row gap-4">
                  <Ionicons name="call-outline" size={18} color={textPrimary} />
                  <Ionicons name="mail-outline" size={18} color={textPrimary} />
                </View>
              </View>
              <View>
                <Text className="text-sm font-bold text-slate-900">{receiver.name}</Text>
                <Text className="text-xs text-slate-500 mt-1 leading-relaxed">{receiver.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Package Details */}
        <View className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <View className="p-3 border-b border-slate-100 flex-row items-center justify-between bg-slate-50/50">
            <Text className="font-bold text-[11px] uppercase tracking-wider text-slate-600">Package Details</Text>
            <Ionicons name="cube-outline" size={18} color="#cbd5e1" />
          </View>
          <View className="p-4 grid grid-cols-3 gap-4">
            <View className="items-center p-2 rounded-lg bg-slate-50">
              <Text className="text-[9px] font-bold text-slate-400 uppercase">Quantity</Text>
              <Text className="text-sm font-bold text-slate-900">{packageDetails.qty}</Text>
            </View>
            <View className="items-center p-2 rounded-lg bg-slate-50">
              <Text className="text-[9px] font-bold text-slate-400 uppercase">Weight</Text>
              <Text className="text-sm font-bold text-slate-900">{packageDetails.weight}</Text>
            </View>
            <View className="items-center p-2 rounded-lg bg-slate-50">
              <Text className="text-[9px] font-bold text-slate-400 uppercase">Type</Text>
              <Text className="text-sm font-bold text-slate-900">{packageDetails.type}</Text>
            </View>
          </View>
        </View>

        {/* Charges & Payment */}
        <View className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <View className="p-3 border-b border-slate-100 flex-row items-center justify-between bg-slate-50/50">
            <Text className="font-bold text-[11px] uppercase tracking-wider text-slate-600">Charges & Payment</Text>
            <Ionicons name="card-outline" size={18} color="#cbd5e1" />
          </View>
          <View className="p-4 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-500">Freight Charges</Text>
              <Text className="text-sm font-semibold text-slate-900">{charges.freight}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-500">Handling Fee</Text>
              <Text className="text-sm font-semibold text-slate-900">{charges.handling}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-slate-500">Insurance</Text>
              <Text className="text-sm font-semibold text-slate-900">{charges.insurance}</Text>
            </View>
            <View className="pt-3 border-top border-slate-100 flex-row justify-between items-center">
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</Text>
                <Text className="text-lg font-bold text-slate-900">{charges.total}</Text>
              </View>
              <Text className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-wide">
                {charges.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Transit Timeline */}
        <View className="bg-white border border-slate-200 rounded-xl overflow-hidden mt-4">
          <View className="p-3 border-b border-slate-100 flex-row items-center justify-between bg-slate-50/50">
            <Text className="font-bold text-[11px] uppercase tracking-wider text-slate-600">Transit Timeline</Text>
            <Ionicons name="swap-vertical-outline" size={18} color="#cbd5e1" />
          </View>
          <View className="p-5 space-y-8">
            {timeline.map((item, idx) => (
              <View key={`{item.title}-${idx}`} className="relative flex-row gap-4">
                <View className="items-center">
                  <View className="relative">
                    <View
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: item.done ? "#10b981" : "#cbd5e1",
                        borderWidth: item.done ? 4 : 0,
                        borderColor: item.done ? "rgba(16,185,129,0.2)" : "transparent",
                      }}
                    />
                    {idx < timeline.length - 1 && <View className="absolute left-[7px] top-4 bottom-[-28px] w-[2px] bg-slate-200" />}
                  </View>
                </View>
                <View className="space-y-1 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-sm font-bold text-slate-900">{item.title}</Text>
                    <Text className="text-[10px] text-slate-400 font-medium">{item.time}</Text>
                  </View>
                  <Text className="text-xs text-slate-500">{item.place}</Text>
                  <Text className="text-[10px] text-slate-400">{item.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Back Button */}
        <View className="pt-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-full bg-slate-200 py-4 rounded-xl items-center">
            <Text className="text-slate-700 font-bold tracking-tight">Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
